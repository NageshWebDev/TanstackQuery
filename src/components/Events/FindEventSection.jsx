import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchEvents } from "../../util/http";
import ErrorBlock from "../UI/ErrorBlock";
import LoadingIndicator from "../UI/LoadingIndicator";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, isError, isLoading } = useQuery({
    /*
      By creating a dynamic query key, React Query can cache 
      different data for different keys based on the same query.
    */
    queryKey: ["events", { search: searchTerm }],
    queryFn: ({ signal, meta, queryKey, direction, pageParam }) =>
      fetchEvents({ signal, searchTerm }),
    /*
      To disable/enable the useQuery
      *when react query is disabled, react query treats it as pending because we don't have any data.
      
      The difference between is loading and is pending is that is loading will not be true if this Query is just disabled.

      here we are programmatically disabling useQuery when there is no serchTerm
    */
    enabled: !!searchTerm,
  });

  let content = <p>Please enter a search term and to find events</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to requested fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    /*
      As soon the searchTerm state is changes the component get rendered,
      resulting in running useQuery 
    */
    setSearchTerm(searchElement.current.value);
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
        {content}
      </header>
    </section>
  );
}
