"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search01Icon, Menu01Icon, ThumbsUpIcon, ThumbsDownIcon, Message01Icon } from "hugeicons-react";

// Import the AlertCircleIcon - if it's not available in your hugeicons-react package, 
// you can use a simple div or import from another icon library
// For now, I'll create a simple fallback

// Sample product data JSON
const productData = {
  products: [
    {
      id: 1,
      name: "Premium Office Chair",
      seller: "Furniture Co.",
      price: 299.99,
      description: "Ergonomic office chair with lumbar support and adjustable height.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 245,
      dislikes: 12,
      comments: 56
    },
    {
      id: 2,
      name: "Wireless Headphones",
      seller: "AudioTech",
      price: 89.99,
      description: "Noise-cancelling wireless headphones with 30-hour battery life.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 189,
      dislikes: 8,
      comments: 34
    },
    {
      id: 3,
      name: "Smart Watch",
      seller: "GadgetPro",
      price: 199.99,
      description: "Fitness tracker with heart rate monitor and GPS.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 156,
      dislikes: 15,
      comments: 23
    },
    {
      id: 4,
      name: "Mechanical Keyboard",
      seller: "KeyCaps",
      price: 149.99,
      description: "RGB mechanical keyboard with blue switches and wrist rest.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 312,
      dislikes: 23,
      comments: 89
    },
    {
      id: 5,
      name: "4K Monitor 27''",
      seller: "DisplayTech",
      price: 399.99,
      description: "27-inch 4K UHD monitor with HDR and IPS panel.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 178,
      dislikes: 9,
      comments: 42
    },
    {
      id: 6,
      name: "Gaming Mouse",
      seller: "Peripherals Pro",
      price: 59.99,
      description: "Wireless gaming mouse with 16000 DPI and RGB lighting.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 423,
      dislikes: 31,
      comments: 67
    },
    {
      id: 7,
      name: "Laptop Stand",
      seller: "ErgoLife",
      price: 45.99,
      description: "Adjustable aluminum laptop stand for better posture.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 134,
      dislikes: 5,
      comments: 28
    },
    {
      id: 8,
      name: "USB-C Hub",
      seller: "ConnectPlus",
      price: 39.99,
      description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 267,
      dislikes: 14,
      comments: 51
    },
    {
      id: 9,
      name: "Desk Lamp",
      seller: "LightingCo",
      price: 29.99,
      description: "LED desk lamp with adjustable brightness and color temperature.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 98,
      dislikes: 3,
      comments: 17
    },
    {
      id: 10,
      name: "Noise Cancelling Earbuds",
      seller: "SoundWave",
      price: 79.99,
      description: "True wireless earbuds with active noise cancellation.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 345,
      dislikes: 21,
      comments: 73
    },
    {
      id: 11,
      name: "External SSD 1TB",
      seller: "StorageHub",
      price: 129.99,
      description: "Portable external SSD with USB 3.2 Gen 2 interface.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 203,
      dislikes: 7,
      comments: 39
    },
    {
      id: 12,
      name: "Webcam 1080p",
      seller: "ViewPro",
      price: 69.99,
      description: "Full HD webcam with built-in microphone and privacy cover.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 156,
      dislikes: 11,
      comments: 29
    },
    {
      id: 13,
      name: "Microphone Arm",
      seller: "AudioGear",
      price: 49.99,
      description: "Adjustable microphone suspension arm with cable management.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 112,
      dislikes: 4,
      comments: 22
    },
    {
      id: 14,
      name: "Desk Mat",
      seller: "DeskStyle",
      price: 24.99,
      description: "Large waterproof desk mat with stitched edges.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 187,
      dislikes: 6,
      comments: 31
    },
    {
      id: 15,
      name: "Cable Management Kit",
      seller: "OrganizeIt",
      price: 19.99,
      description: "Complete cable management kit with clips and ties.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 76,
      dislikes: 2,
      comments: 14
    },
    {
      id: 16,
      name: "Portable Monitor",
      seller: "MobileView",
      price: 249.99,
      description: "15.6-inch portable USB-C monitor for laptops.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 145,
      dislikes: 8,
      comments: 33
    },
    {
      id: 17,
      name: "Wireless Charger",
      seller: "PowerUp",
      price: 34.99,
      description: "15W fast wireless charging pad with LED indicator.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 234,
      dislikes: 12,
      comments: 45
    },
    {
      id: 18,
      name: "Blue Light Glasses",
      seller: "EyeCare",
      price: 29.99,
      description: "Computer glasses that filter blue light and reduce eye strain.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 421,
      dislikes: 18,
      comments: 62
    },
    {
      id: 19,
      name: "Monitor Light Bar",
      seller: "IllumiTech",
      price: 59.99,
      description: "Monitor-mounted LED light bar with auto-dimming feature.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 167,
      dislikes: 7,
      comments: 28
    },
    {
      id: 20,
      name: "Ergonomic Foot Rest",
      seller: "ComfortZone",
      price: 34.99,
      description: "Adjustable foot rest for better sitting posture.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 89,
      dislikes: 3,
      comments: 16
    },
    {
      id: 21,
      name: "Laptop Backpack",
      seller: "TravelGear",
      price: 79.99,
      description: "Water-resistant laptop backpack with USB charging port.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 278,
      dislikes: 15,
      comments: 47
    },
    {
      id: 22,
      name: "Drawing Tablet",
      seller: "CreativePen",
      price: 89.99,
      description: "Graphics drawing tablet with 8192 pressure levels.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 198,
      dislikes: 9,
      comments: 36
    },
    {
      id: 23,
      name: "Stream Deck",
      seller: "StreamPro",
      price: 149.99,
      description: "15-key LCD stream control deck for content creators.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 312,
      dislikes: 17,
      comments: 58
    },
    {
      id: 24,
      name: "Green Screen",
      seller: "StudioGear",
      price: 39.99,
      description: "Collapsible chroma key green screen for video calls.",
      imageUrl: "/assets/images/sale-fast.png",
      likes: 134,
      dislikes: 5,
      comments: 24
    },
    // Malformed data example (missing required fields)
    {
      id: 25,
      // name is missing intentionally to test error handling
      seller: "TechZone",
      price: 149.99,
      // description missing
      imageUrl: "/assets/images/sale-fast.png",
      likes: 0,
      dislikes: 0,
      comments: 0
    }
  ]
};

// Simple Alert icon component if AlertCircleIcon is not available
const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Close icon component if not available in hugeicons-react
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Empty state component
const EmptyState = ({ message = "No products available" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-100 rounded-full p-6 mb-4">
      <AlertIcon />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
    <p className="text-sm text-gray-500">Check back later for new products</p>
  </div>
);

// Avatar component with proper TypeScript typing
interface AvatarProps {
  name: string;
}

const Avatar = ({ name }: AvatarProps) => {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className={`w-10 h-10 rounded-full bg-[#FCFCFC] flex items-center justify-center text-black font-semibold text-sm`}>
      {getInitials(name)}
    </div>
  );
};

// Product type definition
interface Product {
  id: number;
  name?: string;
  seller: string;
  price: number;
  description?: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  comments: number;
}

// Product card component with proper typing
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Validate product data
  const isValidProduct = product && 
    product.name && 
    product.seller && 
    product.price !== undefined && 
    product.description;

  if (!isValidProduct) {
    // Only log to console, don't display anything
    console.log("Invalid product data:", product);
    return null;
  }

  return (
    <div className="card w-[360px] rounded-[12px] bg-white p-[20px] border border-gray-200/40 cursor-pointer hover:scale-[1.02] transition-transform duration-200">
      <div className="product-profile flex justify-between items-center">
        <div className="name-seller-price flex">
          <Image
            src={product.imageUrl || "/assets/images/sale-fast.png"}
            alt={product.name || "Product image"}
            width={45}
            height={45}
            className="rounded-[5px] object-cover"
            onError={(e) => {
              // Type assertion for the event target
              const target = e.target as HTMLImageElement;
              target.src = "/assets/images/placeholder.png"; // Fallback image
            }}
          />
          <div className="ml-3">
            <h2 className="text-sm font-semibold text-gray-800">{product.name}</h2>
            <p className="text-xs text-gray-600 mt-1">{product.seller}</p>
          </div>
        </div>
        <div className="price">
          <p className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="product-info my-4">
        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
      </div>
    
      <Image
        src={product.imageUrl || "/assets/images/sale-fast.png"}
        alt={product.name || "Product image"}
        width={320}
        height={185}
        className="rounded-[12px] object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/assets/images/placeholder.png"; // Fallback image
        }}
      />
      
      <div className="product-actions flex gap-6 mt-4 pt-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <ThumbsUpIcon size={18} />
          <span className="text-xs font-medium">{product.likes || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
          <ThumbsDownIcon size={18} />
          <span className="text-xs font-medium">{product.dislikes || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
          <Message01Icon size={18} />
          <span className="text-xs font-medium">{product.comments || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName] = useState("John Doe"); // This would come from your auth system
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const fetchProducts = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(productData.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const closeOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Fixed Header - Full width */}
      <header className="fixed top-0 left-0 w-full py-4 px-4 sm:px-8 z-50 bg-white/95 backdrop-blur-sm">
        <div className="w-full flex justify-between items-center mx-auto px-[20px] py-[12px]">
          <h1 className="text-[15px] text-black">BIMARKETPLACE</h1>
          <div className="flex items-center gap-4">
            <Avatar name={userName} />
            <Search01Icon size={24} className="text-gray-600 cursor-pointer hover:text-gray-900" />
            <button onClick={toggleOffcanvas} className="focus:outline-none">
              <Menu01Icon size={24} className="text-gray-600 cursor-pointer hover:text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      {/* Offcanvas Overlay */}
      {isOffcanvasOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity"
          onClick={closeOffcanvas}
        />
      )}

      {/* Offcanvas Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOffcanvasOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button 
              onClick={closeOffcanvas}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          
          <nav className="space-y-4">
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Home
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Products
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Categories
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Deals
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              New Arrivals
            </a>
            <div className="border-t border-gray-200 my-4"></div>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Profile
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Settings
            </a>
            <a href="#" className="block py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Logout
            </a>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar name={userName} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <main className="pt-24 pb-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto mt-10">
          {loading ? (
            // Loading state
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            // Empty state
            <EmptyState message="No products found" />
          ) : (
            // Products grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}