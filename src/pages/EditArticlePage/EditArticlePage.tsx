import { useParams } from "react-router-dom";
import ArticleForm from "../../components/ArticleForm/ArtikleForm";
import Layout from "../../components/Layout/Layout";

export default function EditArticlePage() {
  const { id } = useParams();
  return (
    <Layout>
      <div className="create-article-page-wrapper">
        <ArticleForm articleId={id} />
      </div>
    </Layout>
  );
}
