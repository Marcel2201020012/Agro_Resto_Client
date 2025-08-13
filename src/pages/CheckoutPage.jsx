import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CheckoutCard from '../components/CheckoutCard';

function generateTransactionId(tableId = "XX") {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AR-${tableId}-${random}`;
}

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedMenu = location.state?.selectedMenu || [];

    const total = selectedMenu.reduce((acc, item) => acc + item.price * item.jumlah, 0);

    const [showModal, setShowModal] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const [searchParams] = useSearchParams();
    const tableId = searchParams.get("tableId");

    const [fullName, setFullName] = useState('');
    const [fullNameError, setFullNameError] = useState("");

    const [payment, setPayment] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const transaction_id = generateTransactionId(tableId);

    const isFirstLoad = useRef(true);

    useEffect(() => {
        const userName = sessionStorage.getItem("fullName");
        if (userName) {
            setFullName(JSON.parse(userName));
        }

        const payment = sessionStorage.getItem("payment");
        if (payment) {
            setPayment(JSON.parse(payment));
        }
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        sessionStorage.setItem("fullName", JSON.stringify(fullName));
        sessionStorage.setItem("payment", JSON.stringify(payment));
    }, [fullName, payment]);

    const validateFullName = () => {
        if (fullName.trim().length < 3) {
            setFullNameError("Full name must be at least 3 characters long.");
            return false;
        }
        setFullNameError("");
        return true;
    };

    const validatePaymentMethode = () => {
        if (payment === "") {
            setPaymentError("Please choose a payment methode.");
            return false;
        }
        setPaymentError("");
        return true;
    }

    const handleNextClick = (e) => {
        e.preventDefault();

        if (!validateFullName() || !validatePaymentMethode()) return;

        setPendingData({ fullName, selectedMenu, total, payment, transaction_id});

        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);

        if (!pendingData) return;

        try {
            console.log(transaction_id)
            const res = await fetch("/api/createTransaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order: transaction_id,
                    amount: pendingData.total,
                    name: pendingData.fullName,
                }),
            });

            const data = await res.json();

            if (!data.token) throw new Error("Gagal mendapatkan token Midtrans");

            window.snap.pay(data.token, {
                onSuccess: (result) => {
                    console.log("Payment Success:", result);
                    navigate(`/confirm?tableId=${tableId}`, {
                        replace: true,
                        state: pendingData
                    });
                },
                onPending: (result) => {
                    console.log("Payment Pending:", result);
                    navigate(`/confirm?tableId=${tableId}`, {
                        replace: true,
                        state: pendingData
                    });
                },
                onError: (result) => {
                    console.error("Payment Error:", result);
                    alert("Payment gagal, silakan coba lagi.");
                },
                onClose: () => {
                    console.log("Payment popup ditutup tanpa membayar");
                }
            });

        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat memproses pembayaran");
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setPendingData(null);
    };

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
                    <p className="text-green-700 font-semibold">Rp{total}</p>
                </div>
            </div>

            {/* Buyer Details */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Customer Detail</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-left block font-semibold mb-1">Full Name</label>
                    <input
                        className={`w-full border p-2 rounded ${fullNameError ? "border-red-500" : ""}`}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        onBlur={validateFullName}
                    />
                    {fullNameError && (
                        <p className="text-red-500 mt-1 text-sm">{fullNameError}</p>
                    )}
                </div>

                <div>
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
                </div>

                <div>
                    <label className="text-left block font-semibold mb-1">Table ID</label>
                    <input
                        className="w-full border p-2 rounded"
                        value={tableId}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-10">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-agro-color text-white px-6 py-2 rounded-full"
                >
                    Back
                </button>
                <button
                    onClick={handleNextClick}
                    className="bg-agro-color rounded-full text-white px-6 py-2 flex"
                >
                    Next
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
        </div>
    );
}