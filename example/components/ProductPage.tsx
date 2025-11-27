import { useQuery } from "@tanstack/react-query";

export function ProductPage() {
    const { isPending, error, data } = useQuery({
        queryKey: ["productId"],
        queryFn: () =>
            fetch("https://dummyjson.com/products").then((res) => res.json()),
    });
    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const product = data?.products?.[0];
    return (
        <div>
            <h1>{product?.title}</h1>
            <p>Description: {product?.description}</p>
            <p>Price: ${product?.price}</p>
        </div>
    );
}
