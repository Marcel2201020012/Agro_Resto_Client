import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CheckoutCard from '../components/CheckoutCard';
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function generateTransactionId(tableId = "XX") {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AR-${tableId}-${random}`;
}

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isFirstLoad = useRef(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [searchParams] = useSearchParams();

    const selectedMenu = location.state?.selectedMenu || [];
    const total = selectedMenu.reduce((acc, item) => acc + item.price * item.jumlah, 0);
    const tableId = searchParams.get("tableId");
    const transaction_id = generateTransactionId(tableId);

    const [showModal, setShowModal] = useState(false);

    const [selectedOrderType, setSelectedOrderType] = useState("DINE-IN");
    const orderType = ["DINE-IN", "TAKEAWAY"];

    const [fullName, setFullName] = useState("");
    const [fullNameError, setFullNameError] = useState("");

    const [customerNote, setCustomerNote] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    // const [payment, setPayment] = useState("");
    // const [paymentError, setPaymentError] = useState("");

    useEffect(() => {
        const userName = sessionStorage.getItem("fullName");
        if (userName) {
            setFullName(JSON.parse(userName));
        }

        // const payment = sessionStorage.getItem("payment");
        // if (payment) {
        //     setPayment(JSON.parse(payment));
        // }
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        sessionStorage.setItem("fullName", JSON.stringify(fullName));
        // sessionStorage.setItem("payment", JSON.stringify(payment));
    }, [fullName]);

    const validateFullName = () => {
        if (fullName.trim().length < 3) {
            setFullNameError("Full name must be at least 3 characters long.");
            return false;
        }
        setFullNameError("");
        return true;
    };

    const handleEmptyNote = () => {
        if (customerNote.trim().length < 1) {
            setCustomerNote("-");
        }
    };

    // const validatePaymentMethode = () => {
    //     if (payment === "") {
    //         setPaymentError("Please choose a payment methode.");
    //         return false;
    //     }
    //     setPaymentError("");
    //     return true;
    // }

    const handlePayNow = (e) => {
        e.preventDefault();
        handleEmptyNote();
        if (!validateFullName()) return;
        setShowModal(true);
    };

    const handleConfirm = async () => {
        Object.keys(sessionStorage)
            .filter(key => key.startsWith('payment_'))
            .forEach(key => sessionStorage.removeItem(key));

        setShowModal(false);
        setIsProcessing(true);

        try {
            const foodItems = selectedMenu.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                jumlah: item.jumlah
            }));

            const res = await fetch("/api/createTransaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order: transaction_id,
                    amount: total,
                    name: fullName,
                    items: foodItems,
                    tableId: tableId,
                }),
            });

            const data = await res.json();

            if (!data.token) {
                setIsProcessing(false);
                throw new Error("Failed to get Midtrans token");
            }

            sessionStorage.setItem(`payment_${transaction_id}`, data.redirect_url);

            window.snap.pay(data.token, {
                onSuccess: async (result) => {
                    setIsProcessing(false);
                    console.log("Payment Success:", result);

                    const orderData = {
                        orderType: selectedOrderType,
                        customerName: fullName,
                        orderDetails: selectedMenu,
                        notes: customerNote,
                        total,
                        tableId,
                        status: "Preparing Food",
                        createdAt: serverTimestamp(),
                    };

                    //sessionStorage.setItem("isSubmit", 1);
                    setIsSaving(true);
                    await setDoc(doc(db, "transaction_id", transaction_id), orderData);

                    navigate(`/confirm?orderId=${transaction_id}&tableId=${tableId}`, {
                        replace: true,
                        state: orderData
                    });
                },

                onPending: async (result) => {
                    setIsProcessing(false);
                    console.log("Payment Pending:", result);

                    const orderData = {
                        orderType: selectedOrderType,
                        customerName: fullName,
                        orderDetails: selectedMenu,
                        notes: customerNote,
                        total,
                        tableId,
                        status: "Waiting For Payment On Cashier",
                        createdAt: serverTimestamp(),
                    };

                    //sessionStorage.setItem("isSubmit", 1);
                    setIsSaving(true);
                    await setDoc(doc(db, "transaction_id", transaction_id), orderData);

                    navigate(`/confirm?orderId=${transaction_id}&tableId=${tableId}`, {
                        replace: true,
                        state: orderData
                    });
                },

                onError: (result) => {
                    setIsProcessing(false);
                    console.error("Payment Error:", result);
                    alert("Payment failed, please try again.");
                },

                onClose: async () => {
                    setIsProcessing(false);
                    console.log("Payment popup closed");
                    // const orderData = {
                    //     customerName: fullName,
                    //     orderDetails: selectedMenu,
                    //     notes,
                    //     total,
                    //     tableId,
                    //     status: "Waiting For Payment On Cashier",
                    //     createdAt: serverTimestamp(),
                    // };

                    //sessionStorage.setItem("isSubmit", 1);
                    //await setDoc(doc(db, "transaction_id", transaction_id), orderData);

                    const paymentUrl = sessionStorage.getItem(`payment_${transaction_id}`);
                    if (paymentUrl && window.confirm("Payment Closed Unexpectedly. Want to continue payment?")) {
                        window.location.href = paymentUrl;
                    }
                }
            });

        } catch (err) {
            console.error(err);
            alert("Payment Error");
        }
    };

    const handleCancel = () => {
        setShowModal(false);
    };

    if (isSaving) {
        return (
            <div className="container min-h-screen flex justify-center items-center">
                <p className="text-lg font-semibold">Saving your order...</p>
            </div>
        )
    }

    return (
        <div className="container min-h-screen overflow-x-hidden pt-8 pb-16">
            <h1 className="text-left text-sm text-agro-color font-semibold mb-1">CHECKOUT</h1>
            <h2 className="text-left text-2xl font-bold mb-4">Order Detail</h2>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="grid grid-cols-2 gap-4 h-48 overflow-x-hidden scrollbar-hide overflow-y-scroll">
                    {selectedMenu.map((item) => (
                        <CheckoutCard
                            key={item.id}
                            id={item.id}
                            image={item.image}
                            name={item.name}
                            jumlah={item.jumlah}
                            price={item.price}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total Order</p>
                    <p className="text-green-700 font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}</p>
                </div>
            </div>

            {/* Buyer Details */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Customer Detail</h2>

            <div className="space-y-4">
                <div className="flex justify-center gap-4">
                    {orderType.map((option) => (
                        <button
                            key={option}
                            onClick={() => setSelectedOrderType(option)}
                            className={`w-1/2 py-3 font-semibold rounded-lg transition-all duration-300 shadow-md 
            ${selectedOrderType === option
                                    ? "bg-agro-color text-white shadow-lg"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div>
                    <label className="text-left block font-semibold mb-1">Full Name</label>
                    <input
                        className={`w-full border p-2 rounded ${fullNameError ? "border-red-500" : ""}`}
                        value={fullName}
                        placeholder='Enter your full name'
                        onChange={e => setFullName(e.target.value)}
                        onBlur={validateFullName}
                    />
                    {fullNameError && (
                        <p className="text-red-500 mt-1 text-sm">{fullNameError}</p>
                    )}
                </div>

                <div>
                    <label className="text-left block font-semibold mb-1">Notes</label>
                    <input
                        className="w-full border p-2 rounded"
                        value={customerNote}
                        placeholder='Enter notes or request'
                        onChange={e => setCustomerNote(e.target.value)}
                        onBlur={handleEmptyNote}
                    />
                </div>

                {/* <div>
                    <label htmlFor="payment" className="block mb-2 font-medium text-left">
                        Payment Method
                    </label>
                    <select
                        id="payment"
                        value={payment}
                        onBlur={validatePaymentMethode}
                        onChange={e => setPayment(e.target.value)}
                        className={`border rounded p-2 w-full ${paymentError ? "border-red-500" : ""}`}
                    >
                        <option value="">-- Select Payment Method --</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                    </select>
                    {paymentError && (
                        <p className="text-red-500 mt-1 text-sm">{paymentError}</p>
                    )}
                </div> */}

                <div>
                    <label className="text-left block font-semibold mb-1">Table ID</label>
                    <input
                        className="w-full border p-2 rounded"
                        value={tableId}
                        readOnly={true}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10">
                <button
                    onClick={() => navigate(-1)}
                    disabled={isProcessing}
                    className={`bg-agro-color text-white px-6 py-2 rounded-full ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    Back
                </button>
                <button
                    onClick={handlePayNow}
                    disabled={isProcessing}
                    className={`bg-agro-color rounded-full text-white px-6 py-2 flex ${isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {isProcessing ? "Processing..." : "Pay Now"}
                </button>
            </div>

            {/* confirmation pop */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center w-1/2">
                        <h2 className="text-lg font-bold mb-4">Attention</h2>
                        <p>Is the entered data correct?</p>
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={handleConfirm}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="text-white text-lg">Loading...</div>
                </div>
            )}
        </div>
    );
}