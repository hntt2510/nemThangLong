import Image from "next/image";
import type { CompareRow } from "@/lib/compare";
import type { DiscoveryProduct } from "@/lib/discovery";

export function CompareMatrix({ products, rows }: { products: DiscoveryProduct[]; rows: CompareRow[] }) {
  return <div className="compare-matrix-wrap" role="region" aria-label="Bảng so sánh" tabIndex={0}><table className="compare-matrix"><thead><tr><th scope="col">Tiêu chí</th>{products.map((product) => <th scope="col" key={product.slug}><div className="compare-product-heading"><Image src={product.image} alt={product.imageAlt} width={100} height={100} />{product.imageIsDemo && <small>Minh họa</small>}<strong>{product.name}</strong></div></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.key}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={products[index]?.slug ?? index}>{value ?? "Chưa công bố"}</td>)}</tr>)}</tbody></table></div>;
}
