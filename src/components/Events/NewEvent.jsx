import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent, queryClient } from "../../util/http";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();
  /*
   useQuery is used to GET data, not ideal for using POST request,
   but it doesn't mean we can't use useQuery for POST request, after all we are handling the fetchEvents code.
   *use Query is enabled by default due to which as soon as the page get rendered, use query will call quenyFn.

   *useMutation hook is optimized for POST request.
    Allow us to sent request when we want to sent them, reset cached data of a query
    for example inside handle submit function.
  */

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    /*
      Run when mutation is successed/resolved
    */
    onSuccess: () => {
      /*
        Here we are invalidating the cached data, so we can re-fetch the data.
        
        queryClient.invalidateQueries() tells React Query that the data fetched by certain queries is outdated now,
        that it should be marked as stale and that an immediate refetch should be triggered if the Query belongs
        to a component that's currently visible on the screen.

        *If exact is false, invalidate any queryKey that includes 'events' in queryKey.
        */
      queryClient.invalidateQueries({ queryKey: ["events"], exact: false });
      navigate("/events");
    },
  });
  function handleSubmit(formData) {
    /*
      mutate is a function which you can call anywhere in this component to actually send your request(createNewEvent)
      *NOTE:
        { event: formData } schema required by my backend, nothing to do with mutate or useMutation
        *onSuccess will happen what to do after request is resolved
    */
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending ? (
          "Submitting ..."
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>

      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            "Failed to create events. Please check your inputs and try again later."
          }
        />
      )}
    </Modal>
  );
}
