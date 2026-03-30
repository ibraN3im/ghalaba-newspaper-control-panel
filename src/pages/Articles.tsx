import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { Article } from "../services/api";
import { FileText, Eye, Calendar, User, Edit, Trash2, Plus } from "lucide-react";
import { AddArticleModal } from "../components/AddArticleModal";

export function Articles() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getArticles({ limit: 100 });
      let allArticles = data.articles || [];

      // For editors (writers), show only their own articles
      if (user?.role === 'editor') {
        console.log('Current user ID:', user.id);
        console.log('Total articles from API:', allArticles.length);

        const filtered = allArticles.filter((article: any) => {
          const isMyArticle = article.author?.id === user.id;
          if (isMyArticle) {
            console.log('Found my article:', article.title);
          }
          return isMyArticle;
        });

        console.log('Filtered articles (mine):', filtered.length);
        allArticles = filtered;
      }

      setArticles(allArticles);
      setError("");
    } catch (err) {
      setError(t("فشل تحميل المقالات", "Failed to load articles"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من حذف هذا المقال؟", "Are you sure you want to delete this article?"))) {
      return;
    }

    try {
      await apiService.deleteArticle(id);
      await loadArticles();
    } catch (err: any) {
      // Show permission error message
      const errorMessage = err.message || t("فشل حذف المقال", "Failed to delete article");
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleAddArticle = async (articleData: any) => {
    try {
      await apiService.createArticle(articleData);
      setShowAddModal(false);
      setEditingArticle(null);
      await loadArticles();
    } catch (err: any) {
      setError(t("فشل إضافة المقال", "Failed to add article"));
      console.error(err);
    }
  };

  const handleUpdateArticle = async (articleData: any) => {
    try {
      if (!editingArticle) return;
      await apiService.updateArticle(editingArticle._id, articleData);
      setShowAddModal(false);
      setEditingArticle(null);
      await loadArticles();
    } catch (err: any) {
      setError(t("فشل تحديث المقال", "Failed to update article"));
      console.error(err);
    }
  };

  const handleEdit = (article: any) => {
    console.log('Edit article:', article._id, article.title);
    setEditingArticle(article);
    setShowAddModal(true);
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return t("منتهي", "Expired");
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ${t("يوم", "days")}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${t("ساعة", "hours")}`;
    } else {
      return `${diffMins} ${t("دقيقة", "minutes")}`;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-sm md:text-xl font-bold">
            {t("المقالات", "Articles")}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {t("إدارة جميع مقالات الموقع", "Manage all site articles")}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("إضافة مقال", "Add Article")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">{t("جاري التحميل...", "Loading...")}</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t("لا توجد مقالات", "No articles found")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("العنوان", "Title")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                    {t("التصنيف", "Category")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                    {t("الكاتب", "Author")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                    {t("المشاهدات", "Views")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                    {t("التاريخ", "Date")}
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t("الإجراءات", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article: any) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover"
                            src={article.featuredImage}
                            alt=""
                          />
                        </div>
                        <div className="mr-2 sm:mr-4 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                            {article.title[language]}
                          </div>
                          {article.isBreaking && (
                            <div className="flex flex-col gap-1 mt-1">
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block w-fit">
                                {t("عاجل", "Breaking")}
                              </span>
                              {article.breakingExpiresAt && (
                                <span className="text-xs text-orange-600 font-medium">
                                  {t("ينتهي في:", "Expires in:")} {formatTimeRemaining(article.breakingExpiresAt)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap hidden sm:table-cell">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex items-center">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        {article.author.name}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        {article.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium">
                      <button
                        onClick={() => handleDelete(article._id)}
                        className="text-red-600 hover:text-red-900 inline-block mx-2"
                      >
                        {t("حذف", "Delete")}
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-indigo-600 hover:text-indigo-900 inline-block mx-2"
                      >
                        {t("تعديل", "Edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddArticleModal
          onClose={() => {
            setShowAddModal(false);
            setEditingArticle(null);
          }}
          onAdd={editingArticle ? handleUpdateArticle : handleAddArticle}
          articleData={editingArticle}
        />
      )}
    </div>
  );
}
