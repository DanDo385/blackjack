import toast from 'react-hot-toast';

export const showBetAgainPrompt = ({
  message,
  onConfirm,
  icon,
  betAgainCallback,
}: {
  message: string;
  onConfirm: () => void;
  icon: string;
  betAgainCallback: ((confirmed: boolean) => void) | null;
}) =>
  toast(
    (t: any) => (
      <div className="flex flex-col gap-2">
        <div>{message}</div>
        <div className="text-sm">Bet the same amount again?</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
              betAgainCallback?.(true);
            }}
            className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            OK
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              betAgainCallback?.(false);
            }}
            className="rounded bg-gray-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      duration: 10_000,
      icon,
    }
  );
