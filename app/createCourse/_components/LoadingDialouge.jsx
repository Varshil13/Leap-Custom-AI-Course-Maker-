import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function LoadingDialouge({ loading, activeStep }) {
  // New states: 2 = Fetching Courses, 3 = Fetching Progress, 4 = Generating Roadmap, 5 = Saving Roadmap, 'Fetching Videos' = Fetching Videos
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription>
            <div className="flex flex-col  items-center py-10">
              <Image src={"/startup.gif"} width={100} height={100} />

              {activeStep === 2 && (
                <span className="text-lg font-semibold">Fetching your courses...</span>
              )}
              {activeStep === 3 && (
                <span className="text-lg font-semibold">Fetching your progress...</span>
              )}
              {activeStep ===  0 && (
                <>
                  <span className="text-lg font-semibold">Please wait...</span>
                  <h1 className="text-lg font-semibold">
                    Generating your Course Roadmap...
                  </h1>
                </>
              )}
              {activeStep === 1 && (
                <span className="text-lg font-semibold">Saving roadmap...</span>
              )}
              {activeStep === 'Fetching Videos' && (
                <span className="text-lg font-semibold" >Fetching Videos... </span>
              )}
              {activeStep === 'Finishing Course' && (
                <>
                  <span className="text-lg font-semibold">Finalising the course,</span>
                  <h1 className="text-lg font-semibold">This may take a while...</h1>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoadingDialouge;
