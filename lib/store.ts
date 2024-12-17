export type Post = {
    id: number;
    title: string;
    url?: string;
    text?: string;
    points: number;
    walletAddress: string;
    createdAt: number;
    commentsCount: number;
    comments?: { walletAddress: string; text: string; createdAt: number }[];
};

// Simulate a currently connected user wallet
let currentUserWallet: string | null = "2LYPF1FD";

// Simple in-memory store
let postIdCounter = 1;

// Initial posts with no URLs
let posts: Post[] = [
    {
        id: postIdCounter++,
        title: "Programmable IP is coming to ai16zdao’s ElizaOS",
        points: 13,
        walletAddress: "udev4096",
        createdAt: Date.now() - 1000 * 60 * 58, // 58 min ago
        commentsCount: 1,
        comments: [{ walletAddress: "someone", text: "Exciting news!", createdAt: Date.now() - 1000 * 60 * 30 }]
    },
    {
        id: postIdCounter++,
        title: "AI Agent Dev School Session 3",
        points: 189,
        walletAddress: "hashedan",
        createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        commentsCount: 0,
        comments: []
    },
];

// Track upvotes
const upvotesByWallet: Record<string, Set<string>> = {};

if (currentUserWallet && !upvotesByWallet[currentUserWallet]) {
    upvotesByWallet[currentUserWallet] = new Set();
}

export function getCurrentUserWallet() {
    return currentUserWallet;
}

export function disconnectWallet() {
    currentUserWallet = null;
}

export function getPosts() {
    return posts;
}

export function getPostById(id: number): Post | undefined {
    return posts.find(p => p.id === id);
}

export function addPost(newPost: Omit<Post, "id" | "points" | "walletAddress" | "createdAt" | "commentsCount" | "comments">) {
    if (!currentUserWallet) return;
    const completePost: Post = {
        ...newPost,
        id: postIdCounter++,
        points: 1,
        walletAddress: currentUserWallet,
        createdAt: Date.now(),
        commentsCount: 0,
        comments: []
    };
    posts = [completePost, ...posts];
}

export function upvotePost(post: Post, wallet: string) {
    if (!wallet) return;
    if (!upvotesByWallet[wallet]) {
        upvotesByWallet[wallet] = new Set();
    }

    const postId = post.id.toString();
    if (!upvotesByWallet[wallet].has(postId)) {
        post.points += 1;
        upvotesByWallet[wallet].add(postId);
    }
}

export function addCommentToPost(postId: number, text: string) {
    const post = getPostById(postId);
    const wallet = currentUserWallet;
    if (post && wallet && text.trim()) {
        post.comments?.push({ walletAddress: wallet, text: text.trim(), createdAt: Date.now() });
        post.commentsCount = post.comments?.length ?? 0;
    }
}
