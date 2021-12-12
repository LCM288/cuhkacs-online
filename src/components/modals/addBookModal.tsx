import React, { useState, useMemo, useCallback } from "react";
import { Heading, Modal, Button, Form } from "react-bulma-components";
import TextField from "components/fields/textField";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { v4 as uuidv4 } from "uuid";
import {
  LocationKey,
  lengthLimits,
  getISBN,
  replaceLocationCode,
} from "utils/libraryUtils";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { serverTimestamp, increment } from "firebase/database";
import { useUpdate } from "utils/firebase";
import Loading from "components/loading";

const { Control, Field, Label } = Form;

interface Props {
  seriesId: string;
  lastVolume: string | null;
  locations: Record<LocationKey, number>;
  onClose: () => void;
}

type SelectOption = {
  value: string;
  label: string;
};

const AddBookModal = ({
  seriesId,
  lastVolume,
  locations,
  onClose,
}: Props): React.ReactElement => {
  const { loading, update } = useUpdate("library");
  const sortedLocations = useMemo(
    () => Object.keys(locations).sort((a, b) => locations[a] - locations[b]),
    [locations]
  );
  const nextVolumn = useMemo(
    () => (lastVolume ? Math.floor(parseFloat(lastVolume) + 1) : NaN),
    [lastVolume]
  );
  const id = useMemo(() => uuidv4(), []);
  const [volume, setVolume] = useState(
    isNaN(nextVolumn) ? "1" : nextVolumn.toString()
  );
  const [language, setLanguage] = useState<string | null>("中文");
  const [location, setLocation] = useState<string | null>(
    sortedLocations[0] ?? null
  );
  const [isbn, setISBN] = useState("");

  const languageOptions = useMemo(
    () =>
      [
        { label: "中文", value: "中文" },
        { label: "日本語", value: "日本語" },
        { label: "English", value: "English" },
      ] as SelectOption[],
    []
  );

  const selectedLangauge = useMemo(
    () =>
      languageOptions.find(({ value }) => value === language) ?? language
        ? {
            label: language,
            value: language,
          }
        : null,
    [language, languageOptions]
  );

  const locationOptions = useMemo(
    () =>
      sortedLocations.map((val) => ({
        value: val,
        label: val,
      })) as SelectOption[],
    [sortedLocations]
  );

  const selectedLocation = useMemo(
    () =>
      locationOptions.find(({ value }) => value === location) ?? location
        ? {
            label: location,
            value: location,
          }
        : null,
    [location, locationOptions]
  );

  const validateISBN = useCallback((str: string) => {
    const isbn2 = getISBN(str);
    if (!isbn2) {
      toast.error("Invalid ISBN");
      setISBN("");
    } else {
      setISBN(isbn2);
    }
  }, []);

  const onSubmit = useCallback(() => {
    if (!location) {
      console.error("Location is missing");
      return;
    }
    const replacedLocation = replaceLocationCode(location);
    const updates = {
      [`series/data/${seriesId}/locations/${replacedLocation}`]: increment(1),
      [`series/data/${seriesId}/volumeCount`]: increment(1),
      [`series/data/${seriesId}/updatedAt`]: serverTimestamp(),
      [`series_volume/${seriesId}/${id}`]: true,
      "books/count": increment(1),
      [`books/data/${id}`]: {
        seriesId,
        volume,
        language,
        status: "on-shelf",
        location: replacedLocation,
        borrowCount: 0,
        isbn,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      [`locations/data/${replacedLocation}/bookCount`]: increment(1),
      [`location_series/${replacedLocation}/${seriesId}`]: increment(1),
      [`location_book/${replacedLocation}/${id}`]: true,
    };
    console.log(updates);
    update(updates)
      .then(() => {
        toast.success("The book has been added.");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        if (err instanceof Error) {
          toast.error(err.message);
        }
      });
  }, [id, isbn, language, location, onClose, seriesId, update, volume]);

  return (
    <>
      <Loading loading={loading} />
      <Modal show closeOnEsc={false} onClose={onClose}>
        <Modal.Content className="has-background-white box">
          <PreventDefaultForm onSubmit={onSubmit}>
            <Heading className="has-text-centered">Add a new book</Heading>
            <TextField value={id} label="ID" required />
            <TextField
              value={volume}
              setValue={setVolume}
              label="Volume"
              maxLength={lengthLimits.books.volume}
              editable
              required
            />
            <Control>
              <Field>
                <Label>Language*</Label>
                <CreatableSelect
                  value={selectedLangauge}
                  onChange={(newValue) =>
                    setLanguage(
                      newValue?.value?.substring(
                        0,
                        lengthLimits.books.language
                      ) ?? null
                    )
                  }
                  options={languageOptions}
                />
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden-input"
                  value={language ?? ""}
                  onChange={() => {}}
                  required
                />
              </Field>
            </Control>
            <Control>
              <Field>
                <Label>Location*</Label>
                <CreatableSelect
                  value={selectedLocation}
                  onChange={(newValue) =>
                    setLocation(
                      newValue?.value?.substring(0, lengthLimits.location) ??
                        null
                    )
                  }
                  options={locationOptions}
                  placeholder="Location (eg. 08.5)"
                />
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden-input"
                  value={location ?? ""}
                  onChange={() => {}}
                  required
                />
              </Field>
            </Control>
            <TextField
              value={isbn}
              setValue={setISBN}
              label="10 digit or 13 digit ISBN"
              maxLength={lengthLimits.books.isbn}
              onBlur={(event) => validateISBN(event.target.value)}
              editable
              required
            />
            <div className="is-pulled-right buttons pt-4">
              <Button color="primary" type="submit">
                Add
              </Button>
              <Button color="danger" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </PreventDefaultForm>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default AddBookModal;
