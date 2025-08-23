import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export const PaymentInstruction = () => {
    const [showInstruction, setShowInstruction] = useState(true);
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    const handleOk = () => {
        setShowInstruction(false);
    }

    return (
        <>
            {showInstruction &&
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="flex flex-col items-center gap-4 w-3/4 max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-semibold text-gray-800">Thank You for Your Order!</h2>
                        <p className="text-gray-600">
                            Please proceed to the cashier to complete your payment.
                            Show your order ID to the cashier.
                        </p>

                        <div className="text-lg font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded">
                            {orderId}
                        </div>

                        <button
                            onClick={handleOk}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                        >
                            Ok
                        </button>
                    </div>
                </div>
            }
        </>
    );
}