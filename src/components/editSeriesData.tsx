import React, { useCallback, useEffect, useState } from "react";
import { useGetAndListen, useLazyGetServer, useUpdate } from "utils/firebase";
import { LibrarySeries, lengthLimits } from "utils/libraryUtils";
import { toast } from "react-toastify";
import { Form, Button } from "react-bulma-components";
import { PreventDefaultForm } from "utils/domEventHelpers";
import TextField from "components/fields/textField";
import { serverTimestamp } from "firebase/database";

interface Props {
  seriesId: string | undefined;
}

const EditSeriesData = ({ seriesId }: Props): React.ReactElement => {
  const { data, loading, error } = useGetAndListen<LibrarySeries | null>(
    `library/series/data/${seriesId}`
  );
  const { getServer } = useLazyGetServer<Record<string, true> | null>();
  const { update } = useUpdate("library");

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [error]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const resetSeries = useCallback(
    (seriesData: LibrarySeries | null | undefined) => {
      if (seriesData) {
        setTitle(seriesData.title);
        setAuthor(seriesData.author);
      } else {
        setTitle("");
        setAuthor("");
      }
    },
    []
  );

  useEffect(() => {
    if (!isEditingHeader) {
      resetSeries(data);
    }
  }, [data, isEditingHeader, resetSeries]);

  const onSeriesEditSubmit = useCallback(
    async ({
      id,
      title: newTitle,
      author: newAuthor,
    }: {
      id: string | undefined;
      title: string;
      author: string;
    }) => {
      console.log("submit");
      if (!id) {
        console.error("Series ID is missing");
        toast.error("Some error occurred.");
        return;
      }
      setIsUpdateLoading(true);
      const newKeywords = new Set<string>();
      for (let i = 0; i < newTitle.length; i++) {
        newKeywords.add(newTitle.substring(i));
      }
      for (let i = 0; i < newAuthor.length; i++) {
        newKeywords.add(newAuthor.substring(i));
      }
      const seriesUpdate = {
        [`series/data/${id}/title`]: newTitle,
        [`series/data/${id}/author`]: newAuthor,
        [`series/data/${id}/keywordCount`]: newKeywords.size,
        [`series/data/${id}/updatedAt`]: serverTimestamp(),
      };
      const seriesKeywordUpdate: Record<string, true | null> = {};
      const keywordsUpdate: Record<string, true | null> = {};
      try {
        const oldKeywordRecord = await getServer(
          `library/series_keyword/${id}`
        );
        if (oldKeywordRecord) {
          // Setting null must happen before setting true so that it can be overwritten if needed.
          Object.keys(oldKeywordRecord).forEach((keyword) => {
            keywordsUpdate[`keywords/${keyword}/${id}`] = null;
            seriesKeywordUpdate[`series_keyword/${id}/${keyword}`] = null;
          });
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error(err.message);
        }
        setIsUpdateLoading(false);
        return;
      }
      newKeywords.forEach((keyword) => {
        keywordsUpdate[`keywords/${keyword}/${id}`] = true;
        seriesKeywordUpdate[`series_keyword/${id}/${keyword}`] = true;
      });
      const updates = {
        ...seriesUpdate,
        ...keywordsUpdate,
        ...seriesKeywordUpdate,
      };
      try {
        await update(updates);
        toast.success(`Series ${newTitle} has been updated.`);
        setIsEditingHeader(false);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error(err.message);
        }
        setIsUpdateLoading(false);
        return;
      }
      setIsUpdateLoading(false);
    },
    [update, getServer]
  );

  return (
    <PreventDefaultForm
      onSubmit={() => onSeriesEditSubmit({ id: seriesId, title, author })}
    >
      <>
        <Form.Field kind="group" multiline>
          <TextField
            value={title}
            setValue={setTitle}
            label="Title"
            fullwidth
            maxLength={lengthLimits.series.title}
            editable={isEditingHeader}
            loading={loading}
            required
          />
          <TextField
            value={author}
            setValue={setAuthor}
            label="Author"
            fullwidth
            maxLength={lengthLimits.series.author}
            editable={isEditingHeader}
            loading={loading}
            required
          />
          <Button.Group
            className="is-align-self-flex-end mb-1"
            style={{ minWidth: "10.5rem" }}
          >
            {isEditingHeader ? (
              <>
                <Button
                  type="button"
                  color="warning"
                  onClick={() => setIsEditingHeader(false)}
                  loading={isUpdateLoading}
                >
                  Reset
                </Button>
                <Button type="submit" color="success" loading={isUpdateLoading}>
                  Submit
                </Button>
              </>
            ) : (
              <Button
                type="button"
                color="info"
                onClick={() => setIsEditingHeader(true)}
                loading={isUpdateLoading}
              >
                Enable Editing
              </Button>
            )}
          </Button.Group>
        </Form.Field>
      </>
    </PreventDefaultForm>
  );
};

export default EditSeriesData;
