import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function removeSessionStorage() {
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("payment");
    sessionStorage.removeItem("jumlah_menu");
    sessionStorage.removeItem("isSubmit");
}

export const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const total = location.state?.total || 0;
    // const payment = location.state?.payment || "";
    const [status, setStatus] = useState("");
    const [orderDetails, setOrderDetails] = useState(null);

    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");
    const tableId = searchParams.get("tableId");

    const [isSaving, setIsSaving] = useState(true);

    const isSubmit = sessionStorage.getItem("isSubmit")

    const handleConfirm = () => {
        removeSessionStorage();
        navigate(`/menu?tableId=${tableId}`, { replace: true });
    }

    useEffect(() => {
        const stateData = location.state;

        if (stateData) {
            setStatus(stateData.status);
            setOrderDetails(stateData);
            setIsSaving(false);
        } else {
            (async () => {
                try {
                    const res = await fetch(`/api/checkTransaction?orderId=${orderId}`);
                    const paymentData = await res.json();

                    let newStatus;
                    if (paymentData.transaction_status === "settlement") {
                        newStatus = "Preparing Food";
                    } else if (paymentData.transaction_status === "pending") {
                        newStatus = "Waiting For Payment On Cashier";
                    } else {
                        newStatus = "Order Canceled";
                    }

                    // 3. If status has changed, update Firestore
                    if (status !== newStatus) {
                        await updateDoc(docRef, { status: newStatus });
                        setStatus(newStatus);
                    }
                } catch (err) {
                    console.error(err);
                    setStatus("Error fetching order");
                } finally {
                    setIsSaving(false);
                }
            })();
        }

        const jumlahMenu = sessionStorage.getItem("jumlah_menu");
        if (jumlahMenu === null) {
            removeSessionStorage();
            navigate(`/menu?tableId=${tableId}, { replace: true }`);
            return;
        }

        const jumlah = JSON.parse(jumlahMenu);
        if (
            (Array.isArray(jumlah) && jumlah.length === 0) ||
            (typeof jumlah === "object" && !Array.isArray(jumlah) && Object.keys(jumlah).length === 0)
        ) {
            removeSessionStorage();
            navigate(`/menu?tableId=${tableId}, { replace: true }`);
            return;
        }

        // Send email via Formspree
        //         await fetch("https://formspree.io/f/movlppyb", {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Accept: "application/json",
        //             },
        //             body: JSON.stringify({
        //                 _subject: `New Order - Order ID: ${txId}`,
        //                 "Customer Name": fullName,
        //                 "Order Time": orderTime,
        //                 "Order ID": txId,
        //                 "Table Number": tableId,
        //                 "Order Details": formatOrder(selectedMenu),
        //                 "Total": `Rp${total.toString()}`,
        //                 "Notes": `This is an automated notification from Agro Resto.
        // If you have any questions, please contact IT support.`
        //             }),
        //         });
    }, [navigate, orderId, location.state]);

    if (isSaving && isSubmit !== "1") {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Saving your order...</p>
            </div>
        )
    }

    return (
        <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">
            <h1 className="text-left text-sm text-agro-color font-semibold mb-1">CONFRIMATION</h1>
            <h2 className="text-left text-2xl font-bold mb-4">ORDER DETAIL</h2>

            <div className="border p-4 text-sm text-left rounded-xl bg-gray-50 mb-10">
                <div className="grid gap-4">

                    <div>
                        <div className="font-bold">Transcation ID</div>
                        <div>{orderId}</div>
                    </div>

                    <div>
                        <div className="font-bold">Customer Name</div>
                        <div>{orderDetails.customerName}</div>
                    </div>

                    <div>
                        <div className="font-bold">Table Number</div>
                        <div>{tableId}</div>
                    </div>

                    {/* <div>
                        <div className="font-bold">Payment Methode</div>
                        <div>{payment}</div>
                    </div> */}

                    <div>
                        <div className="font-bold">Status</div>
                        <div>{status}</div>
                    </div>

                </div>
            </div>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="space-y-2">
                    {orderDetails?.orderDetails?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="text-left">
                                <span>{item.jumlah}x</span>{' '}
                                <span>{item.name}</span>
                            </div>
                            <div className="text-right font-semibold">
                                Rp {item.price}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="text-green-700 font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderDetails.total)}</p>
                </div>
            </div>

            <div className="flex mt-10">
                <button onClick={handleConfirm} className="bg-agro-color rounded-full text-white px-6 py-2">
                    <span>Back</span>
                </button>
            </div>

        </div>
    );
}