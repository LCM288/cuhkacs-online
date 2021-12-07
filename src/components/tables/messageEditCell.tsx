import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { Form, Button, Tile } from "react-bulma-components";
import Markdown from "components/markdown";
import { toast } from "react-toastify";
import SimpleMDE, { SimpleMDEReactProps } from "react-simplemde-editor";
import { useUpdate } from "utils/firebase";
import { serverTimestamp } from "firebase/database";
import { Message } from "types/db";
import { useForceRerender } from "utils/miscHooks";
import { MessageKey } from "types/tableRow";

const { Input, Field, Control } = Form;

interface Props {
  messageKey: MessageKey;
  type: "string" | "richtext";
  setEditValue: (newValue: string) => void;
  editingValue: string;
  value: string;
  windowWidth: number;
  isExpanded: boolean | undefined;
}

const MessageEditCell = ({
  messageKey,
  type,
  setEditValue,
  editingValue,
  value,
  windowWidth,
  isExpanded,
}: Props): React.ReactElement => {
  const { loading: isSaving, update } = useUpdate<Message, "updatedAt">(
    `publicMessages/${messageKey}`
  );
  const updateMessage = useCallback(
    (message: string) => update({ message, updatedAt: serverTimestamp() }),
    [update]
  );

  const oldValue = useRef<string | undefined>();
  // https://github.com/RIP21/react-simplemde-editor/issues/79
  const { forceRerenderCount, forceRerender } = useForceRerender();

  // set editingValue to new remote value when remote value changed and editingValue not changed
  useEffect(() => {
    if (editingValue === oldValue.current && editingValue !== value) {
      setEditValue(value);
    }
    if (!isSaving) {
      oldValue.current = value;
    }
  }, [editingValue, value, setEditValue, messageKey, isSaving]);

  useEffect(() => {
    if (isExpanded) {
      forceRerender();
    }
  }, [isExpanded, forceRerender]);

  const resetValue = useCallback(() => {
    setEditValue(value);
  }, [value, setEditValue]);

  const updateValue = useCallback(
    (newValue: string) => {
      updateMessage(newValue)
        .then(() => toast.success(`${messageKey} message updated successfully`))
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [updateMessage, messageKey]
  );

  const simpleMDEOption: SimpleMDEReactProps["options"] = useMemo(
    () => ({
      minHeight: "10rem",
      maxHeight: "20rem",
      previewClass: ["editor-preview", "content"],
      toolbar: [
        "bold",
        "italic",
        "strikethrough",
        "|",
        "heading-smaller",
        "heading-bigger",
        "|",
        "code",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "table",
        "horizontal-rule",
        "|",
        "guide",
      ],
      spellChecker: false,
    }),
    []
  );

  const ResetButton = useCallback(
    () => (
      <Button color="danger" outlined onClick={resetValue}>
        Reset
      </Button>
    ),
    [resetValue]
  );

  const UpdateButton = useCallback(
    () => (
      <Button
        color="success"
        onClick={() => updateValue(editingValue)}
        loading={isSaving}
        disabled={value === editingValue}
      >
        Update
      </Button>
    ),
    [updateValue, isSaving, value, editingValue]
  );

  switch (type) {
    case "string":
      return (
        <>
          <Field className="has-addons">
            <Control className="is-expanded">
              <Input
                placeholder="No values set..."
                value={editingValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                  setEditValue(event.target.value)
                }
              />
            </Control>
            {windowWidth > 768 && (
              <>
                <Control>
                  <ResetButton />
                </Control>
                <Control>
                  <UpdateButton />
                </Control>
              </>
            )}
          </Field>
          {windowWidth <= 768 && (
            <Button.Group align="right" className="mb-0">
              <ResetButton />
              <UpdateButton />
            </Button.Group>
          )}
        </>
      );
    case "richtext":
    default:
      return (
        <>
          <Tile
            kind="ancestor"
            className="mb-1"
            style={{ width: "100vw", maxWidth: "calc(100% - 1.5rem)" }}
          >
            <Tile
              kind="parent"
              style={{ maxWidth: windowWidth > 768 ? "50%" : "100%" }}
            >
              <Tile kind="child" style={{ left: "8px", position: "relative" }}>
                <SimpleMDE
                  id={messageKey}
                  key={forceRerenderCount}
                  value={editingValue}
                  onChange={setEditValue}
                  options={simpleMDEOption}
                />
              </Tile>
            </Tile>
            <Tile
              kind="parent"
              vertical
              style={{ maxWidth: windowWidth > 768 ? "50%" : "100%" }}
            >
              <Tile
                kind="child"
                className="box preview-content"
                style={{ left: "8px", position: "relative" }}
              >
                <Markdown>{editingValue}</Markdown>
              </Tile>
            </Tile>
          </Tile>
          <Button.Group align="right" className="mb-0">
            <ResetButton />
            <UpdateButton />
          </Button.Group>
        </>
      );
  }
};

export default MessageEditCell;
