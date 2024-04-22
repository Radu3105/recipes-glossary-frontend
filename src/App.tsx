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
    recipeId: string;
    recipeName: string;
    authorName: string;
    ingredientCount: number;
    skillLevel: string;
}

interface RecipeByAuthor {
    recipeId: string;
    recipeName: string;
}

interface RecipeDetails {
    id: string;
    name: string;
    description: string;
    cookingTime: number;
    preparationTime: number;
    ingredients: string[];
    collections: string[];
    keywords: string[];
    dietTypes: string[];
}

const App: React.FC = () => {
    const RECIPES_PER_PAGE: number = 20;
    
    const [recipeData, setRecipeData] = useState<Recipe[]>([]);
    const [recipesByAuthorData, setRecipesByAuthorData] = useState<RecipeByAuthor[]>([]);
    const [recipeDetailsData, setRecipeDetailsData] = useState<RecipeDetails | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [authorModalCurrentPage, setAuthorModalCurrentPage] =useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalPagesByAuthor, setTotalPagesByAuthor] = useState<number>(0);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false);

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

    useEffect(() => {
        if (selectedAuthor) {
            fetchRecipesByAuthor(selectedAuthor);
        }
    }, [authorModalCurrentPage, selectedAuthor]);

    // Fetch the total number of recipes for a specific author.
    const fetchTotalPagesByAuthor = async (
        authorName: string
    ): Promise<void> => {
        try {
            const response = await axios.get<number>(
                `https://localhost:44389/Recipes/count/${authorName}`
            );
            setTotalPagesByAuthor(Math.ceil(response.data / RECIPES_PER_PAGE));
        } catch (error) {
            console.error("Error " + error);
        }
    };

    // Fetch the details of a specific recipe by a recipe id
    const fetchRecipeDetails = async (recipeId: string): Promise<void> => {
        try {
            const response = await axios.get<RecipeDetails>(
                `https://localhost:44389/Recipes/id/${recipeId}`
            );
            setRecipeDetailsData(response.data);
        } catch (error) {
            console.error("Error " + error);
        }
    };

    // Fetch the recipes by a specific author
    const fetchRecipesByAuthor = async (authorName: string): Promise<void> => {
        try {
            const response = await axios.get<RecipeByAuthor[]>(
                `https://localhost:44389/Recipes/${authorName}/${authorModalCurrentPage}`
            );
            setRecipesByAuthorData(response.data);
        } catch (error) {
            console.error("Error " + error);
        }
    };

    const handleOnRecipeClick = async (recipe: Recipe): Promise<void> => {
        setIsRecipeModalOpen(true);
        setIsAuthorModalOpen(false);
        await fetchRecipeDetails(recipe.recipeId);
    };

    const handleOnAuthorRecipeClick = async (authorRecipeId: string): Promise<void> => {
        setIsRecipeModalOpen(true);
        setIsAuthorModalOpen(false);
        await fetchRecipeDetails(authorRecipeId);
    };

    const handleOnAuthorClick = async (
        event: React.ChangeEvent<unknown>,
        authorName: string
    ): Promise<void> => {
        event.stopPropagation();
        setIsAuthorModalOpen(true);
        setIsRecipeModalOpen(false);
        setAuthorModalCurrentPage(1);
        setSelectedAuthor(authorName);
        await fetchTotalPagesByAuthor(authorName);
        await fetchRecipesByAuthor(authorName);
    };

    const handlePageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ): void => {
        setCurrentPage(value);
    };

    const handleAuthorModalPageChange = (
        event: React.ChangeEvent<unknown>,
        value: number
    ): void => {
        setAuthorModalCurrentPage(value);
    };

    const handleCloseModal = async () => {
        setIsAuthorModalOpen(false);
        setAuthorModalCurrentPage(1);
        if (selectedAuthor) {
            await fetchRecipesByAuthor(selectedAuthor);
        }
    };

    const renderRecipes = (): ReactElement[] => {
        return recipeData.map((recipe: Recipe) => (
            <tr
                key={recipe.recipeId}
                onClick={() => handleOnRecipeClick(recipe)}
            >
                <td>{recipe.recipeName}</td>
                <td
                    className="recipe-table-author"
                    onClick={(event) =>
                        handleOnAuthorClick(event, recipe.authorName)
                    }
                >
                    {recipe.authorName}
                </td>
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
        if (isRecipeModalOpen) {
            return (
                <Modal onClose={() => setIsRecipeModalOpen(false)}>
                    {recipeDetailsData && (
                        <>
                            <h1 className="modal-title">
                                {recipeDetailsData.name}
                            </h1>
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
                            <div className="modal-content-group">
                                <div className="modal-group-1">
                                    <h2>Description</h2>
                                    <p>{recipeDetailsData.description}</p>
                                    <h2>
                                        Ingredients
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
                                <div className="modal-group-2"></div>
                            </div>
                        </>
                    )}
                </Modal>
            );
        }
    };

    const renderAuthorDetailsModal = (): ReactElement | undefined => {
        if (isAuthorModalOpen) {
            return (
                <Modal onClose={handleCloseModal}>
                    {selectedAuthor && (
                        <>
                            <h1 className="author-modal-title">{selectedAuthor}</h1>
                            <table className="author-table">
                                <tbody>
                                    {recipesByAuthorData.map(
                                        (recipeByAuthor: RecipeByAuthor) => (
                                            <tr onClick={() => handleOnAuthorRecipeClick(recipeByAuthor.recipeId)}>{recipeByAuthor.recipeName}</tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                            <div className="author-pagination-group">
                                <div className="pagination">
                                    <Stack spacing={2}>
                                        <Pagination
                                            count={totalPagesByAuthor}
                                            page={authorModalCurrentPage}
                                            onChange={
                                                handleAuthorModalPageChange
                                            }
                                        />
                                    </Stack>
                                </div>
                            </div>
                        </>
                    )}
                </Modal>
            );
        }
    };

    return (
        <div className="app-container">
            {renderRecipeDetailsModal()}
            {renderAuthorDetailsModal()}
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
