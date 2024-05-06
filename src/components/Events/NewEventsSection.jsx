import { useEffect, useState } from "react";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  // Donot need them
  // const [data, setData] = useState();
  // const [error, setError] = useState();
  // const [isLoading, setIsLoading] = useState(false);

  /*
    Tanstack Query does not send http request.
    At least Not own its own,
    You have too write the ccode that sends the actual HTTP request
    Tanstack Query then manages the data, error, caching and much more!
  */

  /*
    React Query caches the response data you are getting back from your requests
    and it will reuse that data whenever it encounters a newer useQuery execution with the same Query Key.
    So for example, if we go back to this page and therefore, this component function executes again,
    React Query will see that this Query Key has been used before and that it did already cache data for that key.
    And it will then instantly yield that data, but at the same time, also send this request again 
    Behind the Scenes to see if updated data is available.
    And then it will kind of silently replace that data with the updated data so that after a couple of seconds
    or however long it takes to fetch that data, we do have the updated data on the screen.
  */

  const { data, isPending, isError, error } = useQuery({
    /* 
      The Query key property (Identifier)

      Every HTTP request you are sending should have such a Query key,  
      which will then internally be used by Tanstack Query   
      to cache the data that's yielded by that request
      so that the response from that request could be reused in the future
      if you are trying to send the same request again  
      and you can configure how long data should be stored and reused by React Query.

      And that key is actually an array.
      An array of values which are then internally stored by React Query
      such that whenever you are using a similar array of similar values,
      React Query sees that and is able to reuse existing data.
    */
    queryKey: ["events", { max: 3 }],
    /*
      The function that the query will use to request/fetch data.
    */
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    /*
      This controls after which time React Query will send such a Behind the Scenes request
      to get updated data if it found data in your cache.
    */
    staleTime: 5000,
    /*
      the Garbage Collection Time.
      This controls how long the data and the cache will be kept around.
      And the default here are five minutes 3,00,000.
    */
    gcTime: 300000,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events"}
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

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
