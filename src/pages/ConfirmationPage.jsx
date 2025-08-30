import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { PaymentInstruction } from "../components/PaymentInstruction";

function removeSessionStorage(txid) {
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("payment");
    sessionStorage.removeItem("jumlah_menu");
    // sessionStorage.removeItem("isSubmit");
    // sessionStorage.removeItem(`payment_${txid}`);
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

    const [status, setStatus] = useState("");
    const [orderDetails, setOrderDetails] = useState(null);

    const [searchParams] = useSearchParams();
    let orderId = searchParams.get("order_id");
    if (!orderId) {
        orderId = searchParams.get("orderId");
    }
    // const transaction_status = searchParams.get("transaction_status");
    const tableId = searchParams.get("tableId");
    // const paymentUrl = sessionStorage.getItem(`payment_${orderId}`);

    const [isSaving, setIsSaving] = useState(true);

    // const isSubmit = sessionStorage.getItem("isSubmit")

    const handleBack = () => {
        removeSessionStorage(orderId);
        navigate(`/menu?tableId=${tableId}`, { replace: true });
    }

    const updateStock = async (details) => {
        if (!details?.orderDetails) return;

        const orderDetailsArray = Object.values(details.orderDetails || {});
        const batchUpdates = orderDetailsArray.map(async (item) => {
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
        // const redirectCheck = sessionStorage.getItem(`payment_${orderId}`) || transaction_status;
        if (!orderId || orderId === "") {
            removeSessionStorage(orderId);
            navigate(`/menu?tableId=${tableId}`, { replace: true });
            return;
        }

        let isMounted = true;
        const docRef = doc(db, "transaction_id", orderId);

        const bootstrapFromNavigationState = async (stateData) => {
            try {
                if (!isMounted) return; // don't update if unmounted
                setStatus(stateData.status);
                setOrderDetails(stateData);

                // await updateDoc(docRef, { paymentUrl });
                if (stateData.status === "Preparing Food") {
                    // await updateStock(stateData);
                }
                // await updateMenuSolds(stateData.orderDetails);

                if (isMounted) setIsSaving(false);
            } catch (err) {
                console.error("Error bootstrapping state:", err);
                if (isMounted) setIsSaving(false);
            }
        };

        if (location.state) {
            console.log("using bootstraping value");
            bootstrapFromNavigationState(location.state);
            navigate(`${location.pathname}${location.search}`, { replace: true });
        }

        const unsubscribe = onSnapshot(docRef, async (snap) => {
            if (!snap.exists() || !isMounted) return;

            const data = snap.data();
            if (!isMounted) return;
            setOrderDetails(data);
            setStatus(data.status);

            try {
                // if (transaction_status === "settlement" && data.status !== "Preparing Food" && data.status !== "Order Finished" && data.status !== "Order Canceled") {
                if (data.status === "Preparing Food") {
                    console.log("run the first condition");
                    // await updateStock(data);
                    // await updateMenuSolds(data.orderDetails);
                    if (isMounted) {
                        await updateDoc(docRef, { status: "Preparing Food" });
                        setStatus("Preparing Food");
                    }
                    // } else if (transaction_status === "pending" && data.status !== "Waiting For Payment On Cashier") {
                    // } else if (data.status !== "Waiting For Payment On Cashier") {
                    //     console.log("run the second condition");
                    //     if (isMounted) {
                    //         await updateDoc(docRef, { status: "Waiting For Payment On Cashier" });
                    //         setStatus("Waiting For Payment On Cashier");
                    //     }
                } else {
                    console.log("run the third condition");
                    if (isMounted) setStatus(data.status);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setStatus("Waiting For Payment On Cashier");
            } finally {
                if (isMounted) setIsSaving(false);
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

        return () => {
            isMounted = false;
            unsubscribe();
        };
        // }, [orderId, location, paymentUrl, navigate]);
    }, [orderId, location, navigate]);

    // const handlePayNow = () => {
    //     window.location.href = paymentUrl;
    // }

    if (isSaving) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Loading order...</p>
            </div>
        )
    }

    return (
        <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">
            {orderDetails.status === "Waiting For Payment On Cashier" &&
                <PaymentInstruction />
            }
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

                    <div>
                        <div className="font-bold">Payment Methode</div>
                        <div>{orderDetails.payment}</div>
                    </div>

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
                    {Object.values(orderDetails.orderDetails).map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="text-left">
                                <span>{item.jumlah}x</span>{' '}
                                <span>{item.name}</span>
                            </div>
                            {item.promotion > 0 ?
                                <div className="text-right font-semibold">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.promotion)}
                                </div>
                                :
                                <div className="text-right font-semibold">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                                </div>
                            }
                        </div>
                    ))}
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Service 10%</span>
                        <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(orderDetails.total * 0.1))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Tax 10%</span>
                        <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(orderDetails.total * 0.1))}</span>
                    </div>
                    {(orderDetails.status === "Preparing Food" || orderDetails.status === "Order Finished") && (<div className="flex justify-between items-center">
                        <span className="font-bold">{orderDetails.payment}</span>
                        {orderDetails.cash ? (<span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(orderDetails.cash))}</span>) : (<span className="font-bold">{new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(Number(orderDetails.total))}</span>)}
                    </div>)}

                    {orderDetails.cash > orderDetails.total && (
                        <div className="flex justify-between items-center">
                            <span className="font-bold">Change</span>
                            <span className="font-bold">{new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(Number(orderDetails.cash))}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <div className="text-left">
                        <p className="font-bold">Total</p>
                        <p className="text-xs italic"> *Tax Included</p>
                    </div>
                    <p className="text-green-700 font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderDetails.total)}</p>
                </div>
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={handleBack} className="bg-agro-color rounded-full text-white px-6 py-2">
                    <span>Back</span>
                </button>

                {/* {status === "Waiting For Payment On Cashier" &&
                    <button onClick={handlePayNow} className="bg-agro-color rounded-full text-white px-6 py-2">
                        <span>Pay Now</span>
                    </button>
                } */}
            </div>

        </div>
    );
}