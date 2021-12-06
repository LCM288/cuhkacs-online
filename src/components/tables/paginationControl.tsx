import React, { useMemo } from "react";
import { Button } from "react-bulma-components";

interface Props {
  gotoPage: (page: number) => void;
  pageIndex: number;
  pageCount: number;
}

const PaginationControl = ({
  gotoPage,
  pageIndex,
  pageCount,
}: Props): React.ReactElement => {
  const pageIndices = useMemo(() => {
    if (pageCount <= 0) {
      return [pageIndex];
    }
    const len = Math.ceil(Math.log(pageCount));
    const diff = Array(len)
      .fill(0)
      .map((_, idx) => 2 ** (idx + 1) - 1);

    return [
      ...diff.map((d) => pageIndex - d),
      pageIndex,
      ...diff.map((d) => pageIndex + d),
    ]
      .filter((x) => x > 0 && x < pageCount - 1)
      .concat(pageCount === 1 ? [0] : [0, pageCount - 1])
      .sort((a, b) => a - b);
  }, [pageIndex, pageCount]);

  return (
    <nav
      className="pagination is-centered"
      role="navigation"
      aria-label="pagination"
    >
      <ul className="pagination-list">
        {pageIndices.map((p) => (
          <li key={p}>
            <Button
              onClick={() => gotoPage(p)}
              className={
                pageIndex === p
                  ? "pagination-link is-current"
                  : "pagination-link"
              }
              aria-label={`Page ${p + 1}`}
              aria-current={pageIndex === p ? "page" : undefined}
            >
              {p + 1}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PaginationControl;
