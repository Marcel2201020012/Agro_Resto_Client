import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

function removeSessionStorage(txid) {
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("payment");
    sessionStorage.removeItem("jumlah_menu");
    // sessionStorage.removeItem("isSubmit");
    sessionStorage.removeItem(`payment_${txid}`);
}

async function updateMenuSolds(orderDetails) {
    if (!Array.isArray(orderDetails)) return;

    const updates = orderDetails.map(async (item) => {
        const menuRef = doc(db, "menu_makanan", item.id);
        await updateDoc(menuRef, {
            solds: increment(item.jumlah),
        });
    });

    // Run all updates in parallel
    await Promise.all(updates);
}

export const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // const payment = location.state?.payment || "";
    const [status, setStatus] = useState("");
    const [orderDetails, setOrderDetails] = useState(null);

    const [searchParams] = useSearchParams();
    let orderId = searchParams.get("order_id");
    if (!orderId) {
        orderId = searchParams.get("orderId");
    }
    const tableId = searchParams.get("tableId");
    const transaction_status = searchParams.get("transaction_status");
    const paymentUrl = sessionStorage.getItem(`payment_${orderId}`);

    const [isSaving, setIsSaving] = useState(true);

    // const isSubmit = sessionStorage.getItem("isSubmit")

    const handleBack = () => {
        removeSessionStorage(orderId);
        navigate(`/menu?tableId=${tableId}`, { replace: true });
    }

    const updateStock = async (details) => {
        if (!details?.orderDetails) return;

        const batchUpdates = details.orderDetails.map(async (item) => {
            try {
                const menuRef = doc(db, "menu_makanan", item.id);
                await updateDoc(menuRef, { stocks: increment(-item.jumlah) });
            } catch (err) {
                console.error(`Failed to update stock for ${item.id}:`, err);
            }
        });

        await Promise.all(batchUpdates);
    };

    useEffect(() => {
        const docRef = doc(db, "transaction_id", orderId);

        const bootstrapFromNavigationState = async (stateData) => {
            try {
                setStatus(stateData.status);
                setOrderDetails(stateData);

                // Update payment URL and solds safely
                await updateDoc(docRef, { paymentUrl });
                if (stateData.status === "Preparing Food") {
                    await updateStock(stateData);
                }
                await updateMenuSolds(stateData.orderDetails);

                setIsSaving(false);
            } catch (err) {
                console.error("Error bootstrapping state:", err);
                setIsSaving(false);
            }
        };

        // If navigation provided state (fast initial UI)
        if (location.state) {
            console.log("State Data Exist -> bootstrap from navigation state");
            bootstrapFromNavigationState(location.state);

            // Clear navigation state
            navigate(`${location.pathname}${location.search}`, { replace: true });
        }

        // Firestore real-time updates (always active)
        const unsubscribe = onSnapshot(docRef, async (snap) => {
            if (!snap.exists()) {
                console.log("No such document!");
                setStatus("Waiting For Payment On Cashier");
                return;
            }

            const data = snap.data();
            setOrderDetails(data);

            try {
                let newStatus;

                if (data.transaction_status === "settlement" && status !== "Preparing Food") {
                    // Update stocks and solds safely
                    await updateStock(data);               // Make sure this function only updates 'stocks'
                    await updateMenuSolds(data.orderDetails); // Only updates 'solds'

                    newStatus = "Preparing Food";
                } else if (data.transaction_status === "pending" && status !== "Waiting For Payment On Cashier") {
                    newStatus = "Waiting For Payment On Cashier";
                }

                if (newStatus) {
                    await updateDoc(docRef, { status: newStatus });
                    setStatus(newStatus);
                } else {
                    setStatus(data.status);
                }
            } catch (err) {
                console.error("Error processing snapshot:", err);
                setStatus("Waiting For Payment On Cashier");
            } finally {
                setIsSaving(false);
            }
        });

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

        return () => unsubscribe();
    }, [orderId, location, paymentUrl, navigate, status]);


    const handlePayNow = () => {
        window.location.href = paymentUrl;
    }

    if (isSaving) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading your order...</p>
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
                        <div className="font-bold">Order Type</div>
                        <div>{orderDetails.orderType}</div>
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
                        <div className="font-bold">Notes</div>
                        <div>{orderDetails.notes}</div>
                    </div>

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
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="text-green-700 font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderDetails.total)}</p>
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={handleBack} className="bg-agro-color rounded-full text-white px-6 py-2">
                    <span>Back</span>
                </button>

                {status === "Waiting For Payment On Cashier" &&
                    <button onClick={handlePayNow} className="bg-agro-color rounded-full text-white px-6 py-2">
                        <span>Pay Now</span>
                    </button>
                }
            </div>

        </div>
    );
}