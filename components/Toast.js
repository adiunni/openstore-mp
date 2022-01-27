export default function Toast({
  headerMessage,
  message,
  setOpenToast,
  openToast,
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic={true}
      style={{
        position: "relative",
        zIndex: "2",
        borderRadius: "10px",
        color: "black",
        padding: "10px",
      }}
    >
      <div
        style={{
          padding: "10px",
          background: "linear-gradient(to right, #00b09b, #96c93d)",
          position: "absolute",
          top: "0px",
          right: "0px",
          borderRadius: "10px",
          transition: "all 0.5s ease-in-out 1s",
        }}
      >
        <div role={"alert"}>
          <div className="toast-header">
            <strong
              style={{
                opacity: openToast ? 1 : 0,
              }}
              className="mr-auto"
            >
              {headerMessage}
            </strong>
            <button
              type="button"
              className="ml-2 mb-1 close"
              data-dismiss="toast"
              aria-label="Close"
              onClick={() => setOpenToast(false)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="toast-body">{message}</div>
        </div>
      </div>
    </div>
  );
}
