import { useState, useEffect } from "react";
import { FaBell, FaTrash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchNotifications, 
  selectNotifications, 
  selectUnreadCount,
  markAsRead,
  deleteNotifications
} from "../redux/slices/notificationSlice";
import { selectUser } from "../redux/slices/authSlice";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);

  // Robust User ID extraction
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications({ userId }));
    }
  }, [dispatch, userId]);

  const handleMarkAsRead = (id) => {
    if (userId) {
      dispatch(markAsRead({ userId, notificationId: id }));
    }
  };

  const handleClearAll = () => {
    if (userId && window.confirm("Are you sure you want to delete all notifications?")) {
      dispatch(deleteNotifications({ userId }));
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (userId) {
      dispatch(deleteNotifications({ userId, notificationId: id }));
    }
  };

  return (
    <div className="relative">
      {/* Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-700 hover:text-orange-500 text-xl relative"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-4 w-[calc(100vw-2.5rem)] sm:w-85 bg-white shadow-2xl rounded-xl border border-gray-100 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const nId = n.id || n._id;
                return (
                  <div
                    key={nId}
                    onClick={() => !n.is_read && handleMarkAsRead(nId)}
                    className={`flex justify-between items-start gap-4 p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                      !n.is_read ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!n.is_read && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
                        <p className={`text-sm ${!n.is_read ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {new Date(n.created_at || Date.now()).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, nId)}
                      className="text-gray-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center border-t">
               <button 
                onClick={() => userId && dispatch(markAsRead({ userId }))}
                className="text-xs font-bold text-orange-500 hover:text-orange-600"
               >
                 Mark all as read
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;