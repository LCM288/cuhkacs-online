import TextField from "components/fields/textField";
import React, { useCallback, useState, useMemo } from "react";
import { Button, Container, Heading, Section } from "react-bulma-components";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { v4 as uuidv4 } from "uuid";
import { increment, serverTimestamp } from "firebase/database";
import { useUpdate } from "utils/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { encodeKeyword, lengthLimits } from "utils/libraryUtils";
import { useSetTitle } from "utils/miscHooks";

const NewSeries = (): React.ReactElement => {
  const id = useMemo(() => uuidv4(), []);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const { loading, update } = useUpdate("library");
  const navigate = useNavigate();

  const onSubmit = useCallback(
    ({
      id: newId,
      title: newTitle,
      author: newAuthor,
    }: {
      id: string;
      title: string;
      author: string;
    }) => {
      const keywords = new Set<string>();
      for (let i = 0; i < newTitle.length; i++) {
        keywords.add(encodeKeyword(newTitle.substring(i)));
      }
      for (let i = 0; i < newAuthor.length; i++) {
        keywords.add(encodeKeyword(newAuthor.substring(i)));
      }
      const seriesUpdate = {
        "series/count": increment(1),
        [`series/data/${newId}`]: {
          title: newTitle,
          author: newAuthor,
          bookCount: 0,
          borrowCount: 0,
          keywordCount: keywords.size,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      };
      const seriesKeywordUpdate: Record<string, unknown> = {};
      const keywordsUpdate: Record<string, unknown> = {};
      keywords.forEach((keyword) => {
        keywordsUpdate[`keyword_series/${keyword}/${newId}`] = true;
        seriesKeywordUpdate[`series_keyword/${newId}/${keyword}`] = true;
      });
      const updates = {
        ...seriesUpdate,
        ...keywordsUpdate,
        ...seriesKeywordUpdate,
      };
      update(updates)
        .then(() => {
          toast.success(`Series ${newTitle} has been added.`);
          navigate(`/library/edit/series/books/${newId}`);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [navigate, update]
  );

  useSetTitle("Adding a new series");

  return (
    <Section>
      <Container>
        <Heading>New series</Heading>
        <PreventDefaultForm onSubmit={() => onSubmit({ id, title, author })}>
          <TextField value={id} label="ID" required />
          <TextField
            value={title}
            setValue={setTitle}
            label="Title"
            maxLength={lengthLimits.series.title}
            editable
            required
          />
          <TextField
            value={author}
            setValue={setAuthor}
            label="Author"
            maxLength={lengthLimits.series.author}
            editable
            required
          />
          <Button.Group className="is-pulled-right mt-4">
            <Button color="primary" type="submit" disabled={loading}>
              Submit
            </Button>
          </Button.Group>
        </PreventDefaultForm>
      </Container>
    </Section>
  );
};

export default NewSeries;
