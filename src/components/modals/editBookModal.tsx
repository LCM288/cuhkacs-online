import React, { useState, useMemo, useCallback } from "react";
import { Heading, Modal, Button, Form } from "react-bulma-components";
import TextField from "components/fields/textField";
import { PreventDefaultForm } from "utils/domEventHelpers";
import {
  LocationKey,
  lengthLimits,
  getISBN,
  encodeLocation,
  decodeLocation,
  LibraryBook,
} from "utils/libraryUtils";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { serverTimestamp, increment } from "firebase/database";

const { Control, Field, Label } = Form;

interface Props {
  update: (value: Record<string, unknown>) => Promise<void>;
  bookData: LibraryBook & { id: string };
  locations: Record<LocationKey, number>;
  onClose: () => void;
}

type SelectOption = {
  value: string;
  label: string;
};

const EditBookModal = ({
  update,
  bookData,
  locations,
  onClose,
}: Props): React.ReactElement => {
  const sortedLocations = useMemo(
    () =>
      Object.keys(locations)
        .filter((locationKey) => locations[locationKey])
        .sort((a, b) => locations[b] - locations[a]),
    [locations]
  );
  const id = useMemo(() => bookData.id, [bookData]);
  const [volume, setVolume] = useState(bookData.volume);
  const [language, setLanguage] = useState<string | null>(bookData.language);
  const [location, setLocation] = useState<string | null>(bookData.location);
  const [isbn, setISBN] = useState(bookData.isbn);

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
      languageOptions.find(({ value }) => value === language) ??
      (language
        ? {
            label: language,
            value: language,
          }
        : null),
    [language, languageOptions]
  );

  const locationOptions = useMemo(
    () =>
      sortedLocations.map((val) => ({
        value: val,
        label: decodeLocation(val),
      })) as SelectOption[],
    [sortedLocations]
  );

  const selectedLocation = useMemo(
    () =>
      locationOptions.find(({ value }) => value === location) ??
      (location
        ? {
            value: location,
            label: decodeLocation(location),
          }
        : null),
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
    const encodedLocation = encodeLocation(location);
    const validatedISBN = getISBN(isbn);
    if (!validatedISBN) {
      toast.error("Invalid ISBN");
      setISBN("");
      return;
    }
    const locationUpdates =
      encodedLocation === bookData.location
        ? {}
        : {
            [`series/data/${bookData.seriesId}/locations/${encodedLocation}`]:
              increment(1),
            [`series/data/${bookData.seriesId}/locations/${bookData.location}`]:
              increment(-1),
            [`series/data/${bookData.seriesId}/updatedAt`]: serverTimestamp(),
            [`locations/data/${encodedLocation}/bookCount`]: increment(1),
            [`locations/data/${encodedLocation}/updatedAt`]: serverTimestamp(),
            [`locations/data/${bookData.location}/bookCount`]: increment(-1),
            [`locations/data/${bookData.location}/updatedAt`]:
              serverTimestamp(),
            [`location_series/${encodedLocation}/${bookData.seriesId}`]:
              increment(1),
            [`location_series/${bookData.location}/${bookData.seriesId}`]:
              increment(-1),
            [`location_book/${encodedLocation}/${id}`]: true,
            [`location_book/${bookData.location}/${id}`]: null,
          };
    const bookUpdates = {
      [`books/data/${bookData.id}/volume`]: volume,
      [`books/data/${bookData.id}/language`]: language,
      [`books/data/${bookData.id}/location`]: encodedLocation,
      [`books/data/${bookData.id}/isbn`]: validatedISBN,
      [`books/data/${bookData.id}/updatedAt`]: serverTimestamp(),
    };
    const updates = {
      ...locationUpdates,
      ...bookUpdates,
    };
    update(updates)
      .then(() => {
        toast.success("The book has been updated.");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        if (err instanceof Error) {
          toast.error(err.message);
        }
      });
  }, [bookData, id, isbn, language, location, onClose, update, volume]);

  return (
    <>
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
                Update
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

export default EditBookModal;
