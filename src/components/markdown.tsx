import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Content } from "react-bulma-components";

interface Props {
  children: string;
}

const Markdown = ({ children }: Props): React.ReactElement => (
  <Content>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
  </Content>
);
export default Markdown;
