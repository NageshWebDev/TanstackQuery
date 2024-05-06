import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";

import Header from "../Header.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import Modal from "../UI/Modal";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  const param = useParams();
  const navigate = useNavigate();
  const eventId = param.id;
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id: eventId }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        /*
          Here, we have set the re fetch type to none, which makes sure that when you call invalidate queries,
          these existing queries 'events' will not automatically be triggered again immediately.
          
          Instead, they will just be invalidated and the next time they are required, they will run again.
          But they will not be re-triggered immediately which otherwise would be the default behavior.

          And here, that's what we want because this makes sure that this event details query of this page
          on which we are currently, at is not triggered again.
        */
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function onDeleteEvent() {
    mutate({ id: eventId });
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch requested event"}
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="image" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action can't be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeletion ? (
              <p>Deleting, please wait a moment.</p>
            ) : (
              <>
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={onDeleteEvent} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="Request Failed"
              message={
                error.info?.message || "Failed to delete requested event"
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
