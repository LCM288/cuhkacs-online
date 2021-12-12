import React from "react";

interface Props {
  seriesId: string;
}

const AddBook = ({ seriesId }: Props): React.ReactElement => {
  return <>Add new books to {seriesId}</>;
};

export default AddBook;
