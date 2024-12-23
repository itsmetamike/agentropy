import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from './auth';
import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Comment = {
    id: string;
    post_id: string;
    username: string;
    auth_type: 'github' | 'wallet';
    text: string;
    created_at: string;
};

export type BlockchainType = 'solana' | 'base' | 'ethereum' | 'arbitrum' | 'optimism';

export type Post = {
    id: string;
    title: string;
    url?: string | null;
    text?: string | null;
    points: number;
    username: string;
    auth_type: 'github' | 'wallet';
    created_at: string;
    upvoters: string[];
    has_token: boolean;
    token_ticker?: string | null;
    token_blockchain?: BlockchainType | null;
    token_contract?: string | null;
    is_token_deployer?: boolean;
    is_token_holder?: boolean;
    comments?: Comment[];
};

export async function getPosts(): Promise<Post[]> {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting posts:', error);
        throw error;
    }
}

export async function validateTokenStatus(
    blockchain: BlockchainType,
    contractAddress: string,
    userAddress: string
): Promise<{ isDeployer: boolean; isHolder: boolean }> {
    if (!userAddress || !contractAddress) {
        return { isDeployer: false, isHolder: false };
    }

    switch (blockchain) {
        case 'solana': {
            try {
                if (!process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) {
                    throw new Error('Alchemy RPC URL not configured');
                }
                const connection = new Connection(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
                const mintPubkey = new PublicKey(contractAddress);
                const userPubkey = new PublicKey(userAddress);

                // Get all token accounts for this mint
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
                    userPubkey,
                    { mint: mintPubkey },
                    'confirmed' as Commitment
                );

                // Check if user has any token accounts with non-zero balance
                const isHolder = tokenAccounts.value.some(account => {
                    const parsedInfo = account.account.data.parsed.info;
                    return parsedInfo.tokenAmount.uiAmount > 0;
                });

                // For now, we'll skip deployer check as it requires more complex verification
                const isDeployer = false;

                return { isDeployer, isHolder };
            } catch (error) {
                console.error('Error checking Solana token status:', error);
                throw new Error('Could not verify token status. Please check your wallet connection and try again.');
            }
        }

        case 'ethereum':
        case 'optimism':
        case 'base':
        case 'arbitrum':
            // For EVM chains, we'll need to use ethers.js or web3.js
            // This is a placeholder for the actual implementation
            return {
                isDeployer: false,
                isHolder: false
            };

        default:
            return { isDeployer: false, isHolder: false };
    }
}

async function checkTokenStatus(
    blockchain: BlockchainType,
    contractAddress: string,
    userAddress: string
): Promise<{ isDeployer: boolean; isHolder: boolean }> {
    // For now, we'll use a simple check based on the post creator's address matching
    // In a production environment, you'd want to use blockchain-specific APIs
    const isDeployer = contractAddress.toLowerCase() === userAddress.toLowerCase();
    
    // For now we'll assume they're a holder if they created the post
    // In production, you'd want to check token balances using blockchain APIs
    const isHolder = isDeployer;  // Simplified for now
    
    return { isDeployer, isHolder };
}

export async function getPostById(id: string): Promise<Post | null> {
    try {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (postError) throw postError;

        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', id);

        if (commentsError) throw commentsError;

        if (!post) return null;

        // Check token deployer and holder status only if the post creator used a wallet
        if (post.has_token && post.token_contract && post.token_blockchain && post.auth_type === 'wallet') {
            try {
                const { isDeployer, isHolder } = await validateTokenStatus(
                    post.token_blockchain,
                    post.token_contract,
                    post.username
                );
                post.is_token_deployer = isDeployer;
                post.is_token_holder = isHolder;
            } catch (error) {
                console.error('Error validating token status:', error);
                post.is_token_deployer = false;
                post.is_token_holder = false;
            }
        } else {
            post.is_token_deployer = false;
            post.is_token_holder = false;
        }

        return { ...post, comments };
    } catch (error) {
        console.error('Error getting post by id:', error);
        throw error;
    }
}

export async function addPost(
    newPost: {
        title: string;
        url?: string | null;
        text?: string | null;
        has_token?: boolean;
        token_ticker?: string | null;
        token_blockchain?: BlockchainType | null;
        token_contract?: string | null;
        is_token_deployer?: boolean;
        is_token_holder?: boolean;
        auth_type: 'github' | 'wallet';
    },
    walletAddress?: string
): Promise<Post> {
    try {
        const { authMethod, user } = useAuthStore.getState();
        if (!authMethod) throw new Error('User must be authenticated to post');
        if (!user) throw new Error('User not found');

        const post: Post = {
            id: uuidv4(),
            title: newPost.title,
            url: newPost.url ?? null,
            text: newPost.text ?? null,
            points: 1,
            username: user.name,
            auth_type: authMethod,
            created_at: new Date().toISOString(),
            upvoters: [],
            has_token: newPost.has_token ?? false,
            token_ticker: newPost.token_ticker ?? null,
            token_blockchain: newPost.token_blockchain ?? null,
            token_contract: newPost.token_contract ?? null,
            is_token_deployer: newPost.is_token_deployer ?? false,
            is_token_holder: newPost.is_token_holder ?? false
        };

        const { error } = await supabase
            .from('posts')
            .insert([post]);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return post;
    } catch (error) {
        console.error('Error adding post:', error);
        throw error;
    }
}

export async function upvotePost(post: Post, username: string): Promise<void> {
    try {
        const { authMethod, user } = useAuthStore.getState();
        if (!authMethod) throw new Error('User must be authenticated to upvote');
        if (!user) throw new Error('User not found');

        // Initialize upvoters if it doesn't exist
        const upvoters = post.upvoters || [];
        if (upvoters.includes(user.name)) return;

        const { error } = await supabase
            .from('posts')
            .update({ 
                points: (post.points || 0) + 1,
                upvoters: [...upvoters, user.name]
            })
            .eq('id', post.id);

        if (error) throw error;
    } catch (error) {
        console.error('Error upvoting post:', error);
        throw error;
    }
}

export async function addCommentToPost(postId: string, text: string, walletAddress?: string): Promise<void> {
    try {
        const { authMethod, user } = useAuthStore.getState();
        if (!authMethod) throw new Error('User must be authenticated to comment');
        if (!user?.name) throw new Error('Username not found');

        const comment = {
            id: uuidv4(),
            post_id: postId,
            text,
            username: user.name,
            auth_type: authMethod === 'github' ? 'github' : 'wallet',
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('comments')
            .insert([comment]);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
