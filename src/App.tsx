import * as React from "react";
import { PrimitiveAtom, atom, useAtom, Atom } from "jotai";
import { selectAtom, splitAtom } from "jotai/utils";
import { focusAtom } from "jotai/optics";

import type { OpticFor } from "optics-ts";

const initialData = {
  people: [
    {
      name: "Luke Skywalker",
      information: { height: 172 },
      siblings: ["John Skywalker", "Doe Skywalker"]
    },
    {
      name: "C-3PO",
      information: { height: 167 },
      siblings: ["John Doe", "Doe John"]
    }
  ],
  films: [
    {
      title: "A New Hope",
      planets: ["Tatooine", "Alderaan"]
    },
    {
      title: "The Empire Strikes Back",
      planets: ["Hoth"]
    }
  ],
  info: {
    tags: ["People", "Films", "Planets", "Titles"]
  }
};

const dataAtom = atom(initialData);
const readOnlyInfoAtom = atom((get) => get(dataAtom).info);

const peopleAtom = focusAtom(dataAtom, (optic) => optic.prop("people"));
const peopleAtomsAtom = splitAtom(peopleAtom);

const focusSiblings = (optic: OpticFor<typeof initialData["people"][number]>) =>
  optic.prop("siblings");

const filmsAtom = focusAtom(dataAtom, (optic) => optic.prop("films"));
const filmAtomsAtom = splitAtom(filmsAtom);

const focusPlanets = (optic: OpticFor<typeof initialData["films"][number]>) =>
  optic.prop("planets");

const Sibling: React.FC<{
  siblingAtom: PrimitiveAtom<
    typeof initialData["people"][number]["siblings"][number]
  >;
}> = ({ siblingAtom }) => {
  const [data, setData] = useAtom(siblingAtom);
  return (
    <li
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) => setData(event.currentTarget.textContent || "")}
    >
      {data}
    </li>
  );
};

const Person: React.FC<{
  personAtom: PrimitiveAtom<typeof initialData["people"][number]>;
}> = ({ personAtom }) => {
  const [person, setPerson] = useAtom(personAtom);
  const siblingsAtom = focusAtom(personAtom, focusSiblings);
  const siblingAtomsAtom = splitAtom(siblingsAtom);
  const [siblingAtoms] = useAtom(siblingAtomsAtom);
  return (
    <>
      <h3
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) =>
          setPerson((prevPerson) => ({
            ...prevPerson,
            name: event.currentTarget.textContent || ""
          }))
        }
      >
        {person.name}
      </h3>
      <h4>
        Height: {person.information.height}
        <button
          onClick={() =>
            setPerson((prevPerson) => ({
              ...prevPerson,
              information: { height: prevPerson.information.height + 1 }
            }))
          }
        >
          Increase
        </button>
        <button
          onClick={() =>
            setPerson((prevPerson) => ({
              ...prevPerson,
              information: { height: prevPerson.information.height - 1 }
            }))
          }
        >
          Decrease
        </button>{" "}
      </h4>
      <span>Siblings:</span>
      <button
        onClick={() => {
          setPerson((prevPerson) => ({
            ...prevPerson,
            siblings: [...prevPerson.siblings, "Change me"]
          }));
        }}
      >
        Add
      </button>
      <ul>
        {siblingAtoms.map((siblingAtom) => (
          <Sibling siblingAtom={siblingAtom} key={`${siblingAtom}`} />
        ))}
      </ul>
    </>
  );
};

const People: React.FC = () => {
  const [peopleAtoms] = useAtom(peopleAtomsAtom);
  return (
    <div>
      <h2>People</h2>
      <ul>
        {peopleAtoms.map((personAtom) => (
          <Person personAtom={personAtom} key={`${personAtom}`} />
        ))}
      </ul>
    </div>
  );
};

const Planet: React.FC<{
  planetAtom: PrimitiveAtom<
    typeof initialData["films"][number]["planets"][number]
  >;
}> = ({ planetAtom }) => {
  const [name, setName] = useAtom(planetAtom);

  return (
    <li
      contentEditable
      suppressContentEditableWarning
      onBlur={(event) =>
        setName((event.currentTarget.textContent as string) || "")
      }
    >
      {name}
    </li>
  );
};

const Film: React.FC<{
  filmAtom: PrimitiveAtom<typeof initialData["films"][number]>;
}> = ({ filmAtom }) => {
  const [film, setFilm] = useAtom(filmAtom);
  const planetsAtom = focusAtom(filmAtom, focusPlanets);
  const planetAtomsAtom = splitAtom(planetsAtom);
  const [planetAtoms] = useAtom(planetAtomsAtom);
  return (
    <>
      <h3
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) =>
          setFilm((prevFilm) => ({
            ...prevFilm,
            title: event.currentTarget.textContent || ""
          }))
        }
      >
        {film.title}
      </h3>
      <span>Planets:</span>{" "}
      <button
        onClick={() => {
          setFilm((prevFilm) => ({
            ...prevFilm,
            planets: [...prevFilm.planets, "Change me"]
          }));
        }}
      >
        Add
      </button>
      <ul>
        {planetAtoms.map((planetAtom) => (
          <Planet planetAtom={planetAtom} key={`${planetAtom}`} />
        ))}
      </ul>
    </>
  );
};

const Films: React.FC = () => {
  const [filmAtoms] = useAtom(filmAtomsAtom);
  return (
    <div>
      <h2>Films</h2>
      <ul>
        {filmAtoms.map((filmAtom) => (
          <Film filmAtom={filmAtom} key={`${filmAtom}`} />
        ))}
      </ul>
    </div>
  );
};

const Tag: React.FC<{
  tagAtom: Atom<typeof initialData["info"]["tags"][number]>;
}> = ({ tagAtom }) => {
  const [tag] = useAtom(tagAtom);
  return <span>#{tag} </span>;
};
const Tags: React.FC = () => {
  const tagsAtom = selectAtom(readOnlyInfoAtom, (s) => s.tags);
  const tagsAtomsAtom = splitAtom(tagsAtom);
  const [tagAtoms] = useAtom(tagsAtomsAtom);
  return (
    <div>
      <h2>Tags</h2>
      <div>
        {tagAtoms.map((tagAtom) => (
          <Tag key={`${tagAtom}`} tagAtom={tagAtom} />
        ))}
      </div>
    </div>
  );
};
const App: React.FC = () => (
  <div className="App">
    <p>
      Everything is editable, so click on items and feel free to change them
    </p>
    <Films />
    <People />
    <Tags />
  </div>
);

export default App;
