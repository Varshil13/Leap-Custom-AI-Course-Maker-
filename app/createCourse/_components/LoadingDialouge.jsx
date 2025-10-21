import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function LoadingDialouge({ loading, activeStep }) {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription>
            <div className="flex flex-col  items-center py-10">
              <Image src={"/startup.gif"} width={100} height={100} />

              {activeStep === 0 && (
                <>
                  <span className="text-lg font-semibold">Please wait... </span>
                  <h1 className="text-lg font-semibold">
                    AI is generating the roadmap
                  </h1>
                </>
              )}
              {activeStep === 1 && (
                <span className="text-lg font-semibold">Saving roadmap... </span>
              )}
              {activeStep === 'Fetching Videos' && (
                <span className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>Fetching Videos</span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoadingDialouge;
