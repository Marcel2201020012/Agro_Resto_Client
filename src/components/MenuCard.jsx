import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

const MenuCard = ({ id, name, cn, desc, price, promotion, stocks, image, jumlah, tambah, kurang }) => {
  const [openPopUp, setOpenPopUp] = useState(false);

  return (

    <div className="relative bg-white rounded-xl shadow-lg p-4">
      {stocks <= 0 &&
        <div className="flex flex-col items-center justify-center absolute inset-0 bg-gray-500/20 backdrop-blur-sm rounded-xl">
          <span className="text-3xl font-bold text-red-500/85 drop-shadow-lg">Empty</span>
        </div>
      }
      <div className="lg:flex">
        <img
          onClick={() => setOpenPopUp(true)}
          src={image}
          alt={name}
          className="h-32 lg:h-64 object-cover rounded-md"
        />

        {/* nama menu + price + promotion*/}
        <div className="text-left">
          <h3 className="text-black text-sm font-medium">{name}</h3>
          <h3 className="text-black text-sm font-medium">{cn}</h3>

          <div className="flex gap-2 items-center">
            <p className={`font-semibold ${promotion > 0 ? "line-through text-red-500 text-xs" : "text-agro-color text-sm"}`}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}
            </p>
            {promotion > 0 &&
              <div className="bg-red-100 rounded-sm p-1">
                <span className="font-semibold text-xs text-red-500">
                  -{Math.round(((price - promotion) / price) * 100)}%
                </span>
              </div>
            }
          </div>

          {promotion > 0 &&
            <p className={"text-agro-color text-sm font-semibold"}>
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(promotion)}
            </p>
          }
        </div>
      </div>

      {/* <div className='text-left'>
        <h3 className='text-sm font-medium'>
          {stocks < 1 ? <div>Stocks: <span className='text-red-500'>Empty</span></div> : <div>Stocks: <span className='text-agro-color'>{stocks}</span></div>}
        </h3>
      </div> */}

      <br />

      {/* Button */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-2">

        {jumlah > 0 && (
          <button className="button-normal button-hover" onClick={() => kurang(id)}>
            <Minus size={16} />
          </button>
        )}

        {jumlah > 0 && (
          <span className="text-black font-semibold w-6">{jumlah}</span>
        )}

        <button className={`rounded-full p-1 ${stocks < 1 || !stocks ? 'bg-gray-200 text-gray-400' : 'button-normal button-hover disable'
          }`} onClick={() => tambah(id)} disabled={stocks < 1}>
          <Plus size={16} />
        </button>
      </div>

      {openPopUp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setOpenPopUp(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={24} />
            </button>

            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover rounded-lg"
            />

            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <h2 className="text-xl font-bold">{cn}</h2>
            <p className="text-gray-500 mb-2">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}
            </p>
            <p className="text-gray-700 overflow-y-auto max-h-40 pr-2">{desc}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuCard;