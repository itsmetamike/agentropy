import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Comment = {
    id: string;
    post_id: string;
    text: string;
    username: string;
    created_at: string;
};

export type BlockchainType = 'solana' | 'base' | 'ethereum' | 'arbitrum' | 'optimism';

export type Post = {
    id: string;
    title: string;
    url?: string;
    text?: string;
    points: number;
    username: string;
    upvoters: string[];
    comments_count: number;
    created_at: string;
    comments?: Comment[];
    has_token: boolean;
    token_ticker?: string;
    token_blockchain?: BlockchainType;
    token_contract?: string;
};

export async function getPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return posts || [];
}

export async function getPostById(id: string) {
    const { data: post, error } = await supabase
        .from('posts')
        .select('*, comments(*)')
        .eq('id', id)
        .single();
    
    if (error) return null;
    return post;
}

export async function addPost(
    newPost: Omit<Post, 
        "id" | 
        "points" | 
        "username" | 
        "created_at" | 
        "comments_count" | 
        "upvoters" | 
        "has_token" | 
        "token_ticker" | 
        "token_blockchain" | 
        "token_contract"
    > & {
        has_token?: boolean;
        token_ticker?: string;
        token_blockchain?: BlockchainType;
        token_contract?: string;
    }, 
    username: string
) {
    const { data: post, error } = await supabase
        .from('posts')
        .insert([{
            id: uuidv4(),
            ...newPost,
            points: 1,
            username,
            created_at: new Date().toISOString(),
            comments_count: 0,
            upvoters: [username],
            has_token: newPost.has_token || false,
            token_ticker: newPost.token_ticker,
            token_blockchain: newPost.token_blockchain,
            token_contract: newPost.token_contract,
        }])
        .select()
        .single();

    if (error) throw error;
    return post;
}

export async function upvotePost(post: Post, username: string) {
    if (post.upvoters.includes(username)) {
        return;
    }

    const { error } = await supabase
        .from('posts')
        .update({ 
            points: post.points + 1,
            upvoters: [...post.upvoters, username]
        })
        .eq('id', post.id);
    
    if (error) throw error;
}

export async function addCommentToPost(postId: string, text: string, username: string) {
    const { error: commentError } = await supabase
        .from('comments')
        .insert([{
            post_id: postId,
            username,
            text
        }]);
    
    if (commentError) throw commentError;

    // Update comment count
    const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId);

    const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: comments?.length || 0 })
        .eq('id', postId);
    
    if (updateError) throw updateError;
}
