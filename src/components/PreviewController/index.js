import React, { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertContext } from '~/App';
import { PreviewContext } from '~/pages/Commercial/Enrollments';

function PreviewController({ children }) {
    const { alertBox } = useContext(AlertContext)
    const { handleOpened, successfullyUpdated } = useContext(PreviewContext)
    useEffect(() => {
        function escFunction(event) {
            if (event.key === "Escape") {
                if (!successfullyUpdated) {
                    alertBox({
                        title: 'Attention!',
                        descriptionHTML: 'Are you sure you want to cancel this form? All changes will be lost.',
                        buttons: [
                            {
                                title: 'No',
                                class: 'cancel'
                            },
                            {
                                title: 'Yes',
                                onPress: async () => {
                                    toast("Changes discarted!", { autoClose: 1000 })
                                    handleOpened(null)
                                }
                            }
                        ]
                    })
                } else {
                    handleOpened(null)
                }
            } else if (event.key === "Enter") {
                event.preventDefault();
            }
        };
        window.addEventListener('keydown', escFunction);

        return () => {
            window.removeEventListener('keydown', escFunction);
        };
    }, [successfullyUpdated]);
    return <>{children}</>;
}

export default PreviewController;
