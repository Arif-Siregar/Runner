export default function sortByCreatedAt(posts, role){
    if (role === "BOH"){
        return [...posts].sort(
            (a,b) => new Date(b.created_at_boh) - new Date(a.created_at_boh)
        );
    } else {
        return [...posts].sort(
            (a,b) => new Date(b.created_at_foh) - new Date(a.created_at_foh)
        );
    }
}