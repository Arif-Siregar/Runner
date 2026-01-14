export default function sortByCreatedAt(posts){
    return [...posts].sort(
        (a,b) => new Date(b.created_at) - new Date(a.created_at)
    );
}