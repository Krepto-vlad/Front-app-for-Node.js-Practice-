import "./createArticlePage.css";
import ArticleForm from "../../components/ArticleForm/ArtikleForm";
import Layout from "../../components/Layout/Layout";

export default function CreateArticlePage() {
  return (
    <Layout>
      <div className="create-article-page-wrapper">
        <ArticleForm />
      </div>
    </Layout>
  );
}
