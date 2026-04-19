interface Props {
  rows?: number;
  cols: number;
}

export default function SkeletonRows({ rows = 3, cols }: Props) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} className="border-b border-border last:border-0">
          {[...Array(cols)].map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
