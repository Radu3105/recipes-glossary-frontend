import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import "./App.css";

interface Recipe {
    id: string;
    recipeName: string;
    authorName: string;
    ingredientCount: number;
    skillLevel: string;
}

const App: React.FC = () => {
    const RECIPES_PER_PAGE: number = 20;

    const [recipeData, setRecipeData] = useState<Recipe[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Fetch the total number of recipes when the application starts.
    useEffect(() => {
        const fetchTotalPages = async () => {
            try {
                const response = await axios.get<number>(
                    "https://localhost:44389/Recipes/count"
                );
                setTotalPages(Math.ceil(response.data / RECIPES_PER_PAGE));
            } catch (error) {
                console.error("Error " + error);
            }
        };
        fetchTotalPages();
    }, []);

    // Fetch the recipes when the application starts and when the current page changes (for paginated results).
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<Recipe[]>(
                    `https://localhost:44389/Recipes?pageNumber=${currentPage}`
                );
                setRecipeData(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };
        fetchData();
    }, [currentPage]);

    const renderRecipes = () => {
        return recipeData.map((recipe: Recipe) => (
            <tr key={recipe.id}>
                <td>{recipe.recipeName}</td>
                <td>{recipe.authorName}</td>
                <td>{recipe.ingredientCount}</td>
                <td
                    className={"skill-" + recipe.skillLevel.split(" ").join("")}
                >
                    {recipe.skillLevel}
                </td>
            </tr>
        ));
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setCurrentPage(value);
    };

    return (
        <div className="app-container">
            <div className="app-title">
                <h1>Recipes Glossary</h1>
                <p>
                    by Radu Cristian Gîrlea |{" "}
                    <span>
                        <a href="https://github.com/Radu3105" target="_blank">
                            <FontAwesomeIcon
                                icon={faGithub}
                                size="lg"
                                color="white"
                            />{" "}
                            Radu3105
                        </a>
                    </span>
                </p>
            </div>
            <div className="main-group">
                <div className="table-group">
                    <table className="recipe-table">
                        <thead>
                            <tr>
                                <th style={{ width: "45%" }}>Name</th>
                                <th style={{ width: "25%" }}>Author</th>
                                <th style={{ width: "15%" }}># of Ingr.</th>
                                <th style={{ width: "15%" }}>Skill Level</th>
                            </tr>
                        </thead>
                        <tbody>{renderRecipes()}</tbody>
                    </table>
                    <div className="pagination-group">
                        <div className="pagination-inverted-border-radius">
                            <div className="pagination-inverted-border-radius-mask-1"></div>
                        </div>
                        <div className="pagination">
                            <Stack spacing={2}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                />
                            </Stack>
                        </div>
                        <div className="pagination-inverted-border-radius">
                            <div className="pagination-inverted-border-radius-mask-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
