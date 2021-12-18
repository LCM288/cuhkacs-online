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
} from "utils/libraryUtils";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { serverTimestamp, increment, push, ref } from "firebase/database";
import { database, useUpdate } from "utils/firebase";
import Loading from "components/loading";

const { Control, Field, Label } = Form;

interface Props {
  seriesId: string;
  nextVolume: number;
  locations: Record<LocationKey, number>;
  onClose: () => void;
}

type SelectOption = {
  value: string;
  label: string;
};

const AddBookModal = ({
  seriesId,
  nextVolume,
  locations,
  onClose,
}: Props): React.ReactElement => {
  const { loading, update } = useUpdate("library");
  const sortedLocations = useMemo(
    () =>
      Object.keys(locations)
        .filter((locationKey) => locations[locationKey])
        .sort((a, b) => locations[b] - locations[a]),
    [locations]
  );
  const [volume, setVolume] = useState(nextVolume.toString());
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
      if (str) {
        toast.error("Invalid ISBN");
      }
      setISBN("");
    } else {
      setISBN(isbn2);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    const id = (await push(ref(database, "library/books/data"))).key;
    if (!id) {
      console.error("Cannot get new id");
      toast.error("Some error has occurred.");
      return;
    }
    if (!location) {
      console.error("Location is missing");
      toast.error("Some error has occurred.");
      return;
    }
    const encodedLocation = encodeLocation(location);
    const validatedISBN = getISBN(isbn);
    if (!validatedISBN) {
      toast.error("Invalid ISBN");
      setISBN("");
      return;
    }
    const updates = {
      [`series/data/${seriesId}/locations/${encodedLocation}`]: increment(1),
      [`series/data/${seriesId}/bookCount`]: increment(1),
      [`series/data/${seriesId}/updatedAt`]: serverTimestamp(),
      [`series_book/${seriesId}/${id}`]: true,
      "books/count": increment(1),
      [`books/data/${id}`]: {
        seriesId,
        volume,
        language,
        status: "on-shelf",
        location: encodedLocation,
        borrowCount: 0,
        isbn: validatedISBN,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      [`locations/data/${encodedLocation}/bookCount`]: increment(1),
      [`locations/data/${encodedLocation}/updatedAt`]: serverTimestamp(),
      [`location_series/${encodedLocation}/${seriesId}`]: increment(1),
      [`location_book/${encodedLocation}/${id}`]: true,
    };
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
  }, [isbn, language, location, onClose, seriesId, update, volume]);

  return (
    <>
      <Loading loading={loading} />
      <Modal show closeOnEsc={false} onClose={onClose}>
        <Modal.Content className="has-background-white box">
          <PreventDefaultForm onSubmit={onSubmit}>
            <Heading className="has-text-centered">Add a new book</Heading>
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
            <Field kind="group" align="right">
              <Button.Group>
                <Button color="primary" type="submit">
                  Add
                </Button>
                <Button color="danger" onClick={onClose}>
                  Cancel
                </Button>
              </Button.Group>
            </Field>
          </PreventDefaultForm>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default AddBookModal;
