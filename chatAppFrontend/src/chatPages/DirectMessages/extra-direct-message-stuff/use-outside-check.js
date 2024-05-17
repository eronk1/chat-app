import { useEffect, useRef } from 'react';

// Function to check if the event target is within the extended area
function isWithinExtendedArea(event, elementRef, marginInRem = 20) {
    if (!elementRef.current) {
        return false;
    }

    const rect = elementRef.current.getBoundingClientRect();
    const marginInPixels = marginInRem * 16; // Convert rem to pixels (assuming 1rem = 16px)

    return (
        event.clientX >= (rect.left - marginInPixels) &&
        event.clientX <= (rect.right + marginInPixels) &&
        event.clientY >= (rect.top - marginInPixels) &&
        event.clientY <= (rect.bottom + marginInPixels)
    );
}

function useOutsideCheck(toggleRef, isVisible, setVisible) {
    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!isWithinExtendedArea(event, toggleRef, 10)) {
                // Handle the mouse outside the extended area
                setVisible(false);
                // You can add additional logic here, such as setting isVisible to false
            }
        };

        if (isVisible) {
            document.addEventListener('mousemove', handleMouseMove);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isVisible, toggleRef]);
}

export default useOutsideCheck;
