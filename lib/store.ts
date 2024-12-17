import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Comment = {
    username: string;
    text: string;
    createdAt: number;
};

export type Post = {
    id: string;
    title: string;
    url?: string;
    text?: string;
    points: number;
    username: string;
    createdAt: number;
    commentsCount: number;
    comments?: Comment[];
    upvoters: string[];
};

export async function getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
    if (error) throw error
    return data || []
}

export async function getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            comments (*)
        `)
        .eq('id', id)
        .single()
    if (error) return null
    return data
}

export async function addPost(newPost: Omit<Post, "id" | "points" | "username" | "createdAt" | "commentsCount" | "comments" | "upvoters">, username: string) {
    const { error } = await supabase
        .from('posts')
        .insert([{
            ...newPost,
            id: uuidv4(),
            points: 1,
            username,
            created_at: new Date().toISOString(),
            comments_count: 0,
            upvoters: [username]
        }])
    if (error) throw error
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
        .eq('id', post.id)
    if (error) throw error
}

export async function addCommentToPost(postId: string, text: string, username: string) {
    const { error: commentError } = await supabase
        .from('comments')
        .insert([{
            post_id: postId,
            username,
            text,
            created_at: new Date().toISOString()
        }])
    if (commentError) throw commentError

    // Update comment count
    const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)

    const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: comments?.length || 0 })
        .eq('id', postId)
    if (updateError) throw updateError
}
