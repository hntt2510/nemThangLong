import Image from "next/image";
import Link from "next/link";
import type { CompareRow } from "@/lib/compare";
import type { DiscoveryProduct } from "@/lib/discovery";

export function CompareMatrix({ products, rows }: { products: DiscoveryProduct[]; rows: CompareRow[] }) {
  return (
    <div className="compare-matrix-wrap" role="region" aria-label="Bảng so sánh" tabIndex={0}>
      <table className="compare-matrix">
        <thead>
          <tr>
            <th scope="col" className="criteria-header-cell">
              <span>ĐẶC TÍNH SẢN PHẨM</span>
            </th>
            {products.map((product) => (
              <th scope="col" key={product.slug} className="product-header-cell">
                <div className="compare-product-heading">
                  <div className="compare-image-stage">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      width={120}
                      height={120}
                      style={{ objectFit: "cover" }}
                    />
                    {product.imageIsDemo && <span className="demo-badge">Minh họa</span>}
                  </div>
                  <small className="eyebrow">{product.eyebrow}</small>
                  <strong>
                    <Link href={"/nem/" + product.slug as never}>{product.name}</Link>
                  </strong>
                  <Link href={"/nem/" + product.slug as never} className="text-link">
                    Chi tiết <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="criteria-label-cell">
                {row.label}
              </th>
              {row.values.map((value, index) => (
                <td key={products[index]?.slug ?? index} className="criteria-value-cell">
                  {value ?? <span className="unreleased-text">Chưa công bố</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
