import { Message02Icon } from "hugeicons-react";

export default function ChatPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-300">
                <Message02Icon size={40} />
            </div>
            <h3 className="text-xl font-black text-zinc-800 mb-2">Your Messages</h3>
            <p className="text-sm font-medium text-zinc-500 max-w-md">
                Select a conversation from the sidebar to view your messages or start a new conversation from a product page.
            </p>
        </div>
    );
}
