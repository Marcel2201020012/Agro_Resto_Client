import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function removeSessionStorage() {
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("payment");
    sessionStorage.removeItem("jumlah_menu");
    sessionStorage.removeItem("isSubmit");
}

function formatOrder(menu) {
    if (!Array.isArray(menu) || menu.length === 0) return "No items ordered.";

    return menu
        .map(item => {
            const name = item.name || item.item || "Unnamed item";
            const qty = item.jumlah || item.quantity || 1;
            return `${name} x${qty}`;
        })
        .join("\n");
}

export const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedMenu = location.state?.selectedMenu || [];
    const total = location.state?.total || 0;
    const fullName = location.state?.fullName || "";
    const payment = location.state?.payment || "";
    const transaction_id = location.state?.transaction_id || "";

    const now = new Date();
    const orderTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const [searchParams] = useSearchParams();
    const tableId = searchParams.get("tableId");

    const hasSaved = useRef(false);
    const [isSaving, setIsSaving] = useState(true);

    const isSubmit = sessionStorage.getItem("isSubmit")

    const handleConfirm = () => {
        removeSessionStorage();
        navigate(`/menu?tableId=${tableId}`, { replace: true });
    }

    useEffect(() => {
        const jumlahMenu = sessionStorage.getItem("jumlah_menu");

        if (jumlahMenu === null) {
            removeSessionStorage();
            navigate(`/menu?tableId=${tableId}`, { replace: true });
            return;
        }

        const jumlah = JSON.parse(jumlahMenu);

        if (
            (Array.isArray(jumlah) && jumlah.length === 0) ||
            (typeof jumlah === "object" && !Array.isArray(jumlah) && Object.keys(jumlah).length === 0)
        ) {
            removeSessionStorage();
            navigate(`/menu?tableId=${tableId}`, { replace: true });
            return;
        }

        const saveOrder = async () => {
            if (hasSaved.current) return;
            hasSaved.current = true;
            const txId = transaction_id;

            const orderData = {
                customerName: fullName,
                status: "Waiting For Payment On Cashier",
                orderDetails: selectedMenu,
                total,
                tableId,
                createdAt: serverTimestamp(),
                payment
            };

            try {
                await setDoc(doc(db, "transaction_id", txId), orderData);
                sessionStorage.setItem("isSubmit", "1");
                console.log("Order saved:", txId);

                // Send email via Formspree
                await fetch("https://formspree.io/f/movlppyb", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        _subject: `New Order - Order ID: ${txId}`,
                        "Customer Name": fullName,
                        "Order Time": orderTime,
                        "Order ID": txId,
                        "Table Number": tableId,
                        "Order Details": formatOrder(selectedMenu),
                        "Total": `Rp${total.toString()}`,
                        "Notes": `This is an automated notification from Agro Resto.
If you have any questions, please contact IT support.`
                    }),
                });
            } catch (error) {
                console.error("Error saving order:", error);
            } finally {
                setIsSaving(false);
            }
        };

        if (isSubmit !== "1") {
            saveOrder()
        }

    }, [navigate, fullName, selectedMenu, total, tableId, payment]);

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
                        <div>{transaction_id}</div>
                    </div>

                    <div>
                        <div className="font-bold">Customer Name</div>
                        <div>{fullName}</div>
                    </div>

                    <div>
                        <div className="font-bold">Table Number</div>
                        <div>{tableId}</div>
                    </div>

                    <div>
                        <div className="font-bold">Payment Methode</div>
                        <div>{payment}</div>
                    </div>

                    <div>
                        <div className="font-bold">Status</div>
                        <div>Waiting For Payment on Cashier</div>
                    </div>

                </div>
            </div>

            <div className="border p-4 rounded-xl bg-gray-50">
                <div className="space-y-2">
                    {selectedMenu.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                            <div className="text-left">
                                <span>{item.jumlah}x</span>{' '}
                                <span>{item.name}</span>
                            </div>
                            <div className="text-right font-semibold">
                                Rp{item.price}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-4 border-t pt-2">
                    <p className="font-semibold">Total</p>
                    <p className="text-green-700 font-semibold">Rp{total}</p>
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