import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const eventId = useParams().id;
  const { data, isError, error } = useQuery({
    queryKey: ["events", { id: eventId }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    /*
      onMutate, is called as soon 'updateEvent' is called.
      It will NOT wait for the mutation function to get resolved.

      *on mutate we can update the data that's cached by React Query
    */
    onMutate: async (dataFromMutate) => {
      const { event: newEvent } = dataFromMutate;
      /*
        Only cancel quires triggered with uiseQuery
      */
      await queryClient.cancelQueries({
        queryKey: ["events", { id: eventId }],
      });

      /*
        Rollback data: If our API get failed we need previous cached data, 
        so we can rollback to it or render cashed data
      */
      const prevEventData = queryClient.getQueriesData([
        "events",
        { id: eventId },
      ]);

      queryClient.setQueryData(["events", { id: eventId }], newEvent);

      /*
        Used by the context in onError Fn
      */
      return { previousEvent: prevEventData };
    },
    /*
      If updateEvent fails, it will receive teh error object,
      data: which is passed to mutationFn
    */
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ["events", { id: eventId }],
        context.previousEvent
      );
    },
    /*
      Lets explore it...
    */
    onSettled: () => {},
  });

  function handleSubmit(formData) {
    mutate({ id: eventId, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch requested event"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  const eventId = params.id;
  /*
    fetchQuery method  can be used to trigger a query programmatically.
  */
  return queryClient.fetchQuery({
    queryKey: ["events", { id: eventId }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId }),
  });
}
