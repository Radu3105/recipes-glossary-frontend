import "./App.css";
import { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Modal from "./components/Modal";
import { sToTime } from "./helpers";

interface Recipe {
    recipeID: string;
    recipeName: string;
    authorName: string;
    ingredientCount: number;
    skillLevel: string;
}

interface RecipeDetails {
    id: string;
    name: string;
    description: string;
    cookingTime: number;
    preparationTime: number;
    ingredients: string[];
}

const App: React.FC = () => {
    const RECIPES_PER_PAGE: number = 20;

    const [recipeData, setRecipeData] = useState<Recipe[]>([]);
    const [recipeDetailsData, setRecipeDetailsData] =
        useState<RecipeDetails | null>(null);
    const [selectedRecipeData, setSelectedRecipeData] = useState<Recipe | null>(
        null
    );
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Fetch the total number of recipes when the application starts.
    useEffect(() => {
        const fetchTotalPages = async (): Promise<void> => {
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
        const fetchRecipes = async (): Promise<void> => {
            try {
                const response = await axios.get<Recipe[]>(
                    `https://localhost:44389/Recipes?pageNumber=${currentPage}`
                );
                setRecipeData(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };
        fetchRecipes();
    }, [currentPage]);

    // Fetch the details of a specific recipe by a recipe id
    const fetchRecipeDetails = async (recipeId: string): Promise<void> => {
        try {
            const response = await axios.get<RecipeDetails>(
                `https://localhost:44389/Recipes/${recipeId}`
            );
            setRecipeDetailsData(response.data);
        } catch (error) {
            console.error("Error " + error);
        }
    };

    const renderRecipes = (): ReactElement[] => {
        return recipeData.map((recipe: Recipe) => (
            <tr
                key={recipe.recipeID}
                onClick={() => handleOnRecipeClick(recipe)}
            >
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

    const renderRecipeDetailsModal = (): ReactElement | undefined => {
        if (isModalOpen) {
            return (
                <Modal onClose={() => setIsModalOpen(false)}>
                    {recipeDetailsData && selectedRecipeData && (
                        <>
                            <h1 className="modal-title">
                                {selectedRecipeData.recipeName}
                            </h1>
                            <p className="modal-author">
                                by {selectedRecipeData.authorName}
                            </p>
                            <p>
                                Preparation time:{" "}
                                <b>
                                    <span>
                                        {sToTime(
                                            recipeDetailsData.preparationTime
                                        )}
                                    </span>
                                </b>
                            </p>
                            <p>
                                Cooking time:{" "}
                                <b>
                                    <span>
                                        {sToTime(recipeDetailsData.cookingTime)}
                                    </span>
                                </b>
                            </p>
                            <p>
                                Skill level:{" "}
                                <span
                                    className={
                                        "skill-" +
                                        selectedRecipeData.skillLevel
                                            .split(" ")
                                            .join("")
                                    }
                                >
                                    {selectedRecipeData.skillLevel}
                                </span>
                            </p>
                            <div className="modal-content-group">
                                <div className="modal-group-1">
                                    <h2>Description</h2>
                                    <p>{recipeDetailsData.description}</p>
                                    <h2>
                                        Ingredients (
                                        {selectedRecipeData.ingredientCount})
                                    </h2>
                                    <ul>
                                        {recipeDetailsData.ingredients.map(
                                            (ingredient) => (
                                                <li
                                                    style={{
                                                        listStyleType: "circle",
                                                    }}
                                                    key={ingredient}
                                                >
                                                    {ingredient}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </>
                    )}
                </Modal>
            );
        }
    };

    const handleOnRecipeClick = (recipe: Recipe): void => {
        setIsModalOpen(true);
        fetchRecipeDetails(recipe.recipeID);
        setSelectedRecipeData(recipe);
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ): void => {
        setCurrentPage(value);
    };

    return (
        <div className="app-container">
            {renderRecipeDetailsModal()}
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
