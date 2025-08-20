const CheckoutCard = ({ image, name, jumlah, price, promotion }) => {
    return (
        <div className="bg-white p-3 rounded-xl shadow-md">
            <img src={image} alt={name} className="rounded-full w-24 h-24 mx-auto object-cover" />
            <h3 className="text-sm font-semibold mt-2">{name} - {jumlah} Item</h3>
            {promotion > 0 ? <p className="text-green-700 font-semibold text-sm">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(promotion)}</p> : <p className="text-green-700 font-semibold text-sm">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}</p>}
        </div>
    )
}

export default CheckoutCard;