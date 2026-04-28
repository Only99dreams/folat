import toast from "react-hot-toast";

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(message: string) {
  toast.error(message);
}

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;

    const complete = (value: boolean, id: string) => {
      if (resolved) return;
      resolved = true;
      toast.dismiss(id);
      resolve(value);
    };

    const toastId = toast.custom(
      (t) => (
        <div className="w-[320px] rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-medium text-navy-900">{message}</p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                complete(false, t.id);
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                complete(true, t.id);
              }}
              className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );

    setTimeout(() => {
      complete(false, toastId);
    }, 10000);
  });
}
