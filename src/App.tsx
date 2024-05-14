import "./App.css";
import { ReactElement, useEffect, useState } from "react";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFilter, faMagnifyingGlass, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import background from "./assets/doodle_food_pattern_new.jpg";
import Modal from "./components/Modal";
import { sToTime, capitalizeFirstLetter } from "./helpers";

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

interface SortConfig {
    sortBy: string;
    order: string;
    searchQuery: string;
    ingredientFilters: string[];
}

interface CommonIngredient {
    name: string;
    recipeCount: number;
}

interface ProlificAuthor {
    authorName: string;
    recipeCount: number;
}

const App: React.FC = () => {
    const RECIPES_PER_PAGE: number = 20;

    const [recipeData, setRecipeData] = useState<Recipe[]>([]);
    const [recipeDataConfig, setRecipeDataConfig] =
        useState<SortConfig>({
            sortBy: "name",
            order: "ASC",
            searchQuery: "",
            ingredientFilters: [],
        });
    const [filters, setFilters] = useState<string[]>([]);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [top5MostCommonRecipes, setTop5MostCommonRecipes] = useState<CommonIngredient[]>([]);
    const [top5MostProlificAuthors, setTop5MostProlificAuthors] = useState<ProlificAuthor[]>([]);
    const [top5MostComplexRecipes, setTop5MostComplexRecipes] = useState<Recipe[]>([]);
    const [isTop5IngredientsDropdownOpen, setIsTop5IngredientsDropdownOpen] = useState<boolean>(false);
    const [isTop5AuthorsDropdownOpen, setIsTop5AuthorsDropdownOpen] = useState<boolean>(false);
    const [isTop5RecipesDropdownOpen, setIsTop5RecipesDropdownOpen] = useState<boolean>(false);
    const [recipesByAuthorData, setRecipesByAuthorData] = useState<RecipeByAuthor[]>([]);
    const [recipeDetailsData, setRecipeDetailsData] = useState<RecipeDetails | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [authorModalCurrentPage, setAuthorModalCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalPagesByAuthor, setTotalPagesByAuthor] = useState<number>(0);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState<boolean>(false);

    useEffect(() => {
        // Fetch the top 5 most common ingredients when the application starts
        const fetchTop5MostCommonIngredients = async (): Promise<void> => {
            try {
                const response = await axios.get<CommonIngredient[]>(
                    `https://localhost:44389/Recipes/top-5-most-common-ingredients`
                );
                setTop5MostCommonRecipes(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };

        // Fetch the top 5 most prolific authors when the application starts
        const fetchTop5MostProlificAuthors = async (): Promise<void> => {
            try {
                const response = await axios.get<ProlificAuthor[]>(
                    `https://localhost:44389/Recipes/top-5-most-prolific-authors`
                );
                setTop5MostProlificAuthors(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };

        // Fetch the top 5 most complex recipes when the application starts
        const fetchTop5MostComplexRecipes = async (): Promise<void> => {
            try {
                const response = await axios.get<Recipe[]>(
                    `https://localhost:44389/Recipes/top-5-most-complex-recipes`
                );
                setTop5MostComplexRecipes(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };

        fetchTop5MostProlificAuthors();
        fetchTop5MostCommonIngredients();
        fetchTop5MostComplexRecipes();
    }, []);

    useEffect(() => {
        if (selectedAuthor) {
            fetchRecipesByAuthor(selectedAuthor);
        }
    }, [authorModalCurrentPage, selectedAuthor]);

    useEffect(() => {
        const fetchIngredients = async (): Promise<void> => {
            try {
                const response = await axios.get<string[]>(
                    `https://localhost:44389/Ingredients`
                );
                setFilters(response.data);
            } catch (error) {
                console.error("Error " + error);
            }
        };

        fetchIngredients(); 
        setCurrentPage(1);
    }, [activeFilters]);

    useEffect(() => {
        if (searchQuery === '') {
            setCurrentPage(1);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchRecipes(
            currentPage,
            recipeDataConfig["sortBy"],
            recipeDataConfig["order"],
            recipeDataConfig["searchQuery"],
            recipeDataConfig["ingredientFilters"]
        );
        console.log(recipeDataConfig);
    }, [currentPage, recipeDataConfig]);

    const fetchRecipes = async (
        pageNumber: number,
        sortBy: string,
        sortOrder: string,
        searchQuery: string,
        ingredientFilters: string[]
    ): Promise<void> => {
        const baseUrl = `https://localhost:44389/Recipes`;
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            sortBy,
            sortOrder,
            ...(searchQuery && { searchQuery }),
            ...(ingredientFilters.length > 0 && {
                ingredientFilters: ingredientFilters.join(","),
            }), // Join array into a comma-separated string if your API expects it this way
        }).toString();

        console.log(params);

        const fullUrl = `${baseUrl}?${params}`;

        console.log("Calling API URL:", fullUrl); // Log the full URL

        try {
            const response = await axios.get(fullUrl); // Use the full URL directly
            setRecipeData(response.data["recipes"]);
            setTotalPages(
                Math.ceil(response.data["totalCount"] / RECIPES_PER_PAGE)
            );
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };
    

    // Fetch the total number of recipes for a specific author
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

    const handleOnAuthorRecipeClick = async (
        authorRecipeId: string
    ): Promise<void> => {
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

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setRecipeDataConfig({...recipeDataConfig, searchQuery: searchQuery});
        setCurrentPage(1);
    };

    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
        if (event.target.value === "") {
            setRecipeDataConfig({...recipeDataConfig, searchQuery: event.target.value});
            setCurrentPage(1);
            fetchRecipes(
                currentPage,
                recipeDataConfig["sortBy"],
                recipeDataConfig["order"],
                recipeDataConfig["searchQuery"],
                recipeDataConfig["ingredientFilters"]
            );
        }
    };

    const handleFilterItemClick = async (ingredientFilterName: string) => {
        setActiveFilters([...activeFilters, ingredientFilterName]);
        const newIngredientFilters = recipeDataConfig["ingredientFilters"];
        newIngredientFilters.push(ingredientFilterName);
        setRecipeDataConfig({...recipeDataConfig, ingredientFilters: newIngredientFilters});
    };

    const handleActiveFilterItemClick = async (activeFilter: string) => {
        const newFilters = activeFilters.filter((filter) => filter !== activeFilter);
        setActiveFilters(newFilters);
        setRecipeDataConfig({...recipeDataConfig, ingredientFilters: newFilters});
    };

    const renderFilterDropdown = (): ReactElement | undefined => {
        if (isFilterDropdownOpen) {
            return (
                <div className="filter-dropdown">
                    {activeFilters.length > 0 && (
                        <>
                            <h4 style={{ color: "dodgerblue" }}>
                                Active filters
                            </h4>
                            <hr></hr>
                            <div>
                                {activeFilters.map(
                                    (activeIngredientFilter: string) => (
                                        <div>
                                            <p
                                                onClick={() =>
                                                    handleActiveFilterItemClick(
                                                        activeIngredientFilter
                                                    )
                                                }
                                                style={{ color: "dodgerblue" }}
                                            >
                                                {activeIngredientFilter}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                    <h4>All filters</h4>
                    <hr></hr>
                    {filters.map((ingredientFilter) => (
                        <div>
                            <p
                                onClick={() =>
                                    handleFilterItemClick(ingredientFilter.name)
                                }
                            >
                                {ingredientFilter.name}
                            </p>
                        </div>
                    ))}
                </div>
            );
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
                                    <p>{recipeDetailsData.description + "."}</p>
                                    <h2>Ingredients ({recipeDetailsData.ingredients.length})</h2>
                                    <ul>
                                        {recipeDetailsData.ingredients.map(
                                            (ingredient) => (
                                                <li className="modal-ingredient-item"
                                                    key={ingredient}
                                                >
                                                    {ingredient}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                                <div className="modal-group-2">
                                    {recipeDetailsData.collections.length > 0 && (
                                        <>
                                            <h2>Collections</h2>
                                            <div className="collection-container">
                                                {recipeDetailsData.collections.map(
                                                    (collection) => (
                                                        <p className="collection-item-collection">
                                                            {collection}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {recipeDetailsData.keywords.length > 0 && (
                                        <>
                                            <h2>Keywords</h2>
                                            <div className="collection-container">
                                                {recipeDetailsData.keywords.map(
                                                    (keyword) => (
                                                        <p className="collection-item-keyword">
                                                            {keyword}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                                    {recipeDetailsData.dietTypes.length > 0 && (
                                        <>
                                            <h2>Diet Type</h2>
                                            <div className="collection-container">
                                                {recipeDetailsData.dietTypes.map(
                                                    (dietType) => (
                                                        <p className="collection-item-diet-type">
                                                            {dietType}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
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
                            <h1 className="author-modal-title">
                                {selectedAuthor}
                            </h1>
                            <table className="author-table">
                                <tbody>
                                    {recipesByAuthorData.map(
                                        (recipeByAuthor: RecipeByAuthor) => (
                                            <tr
                                                onClick={() =>
                                                    handleOnAuthorRecipeClick(
                                                        recipeByAuthor.recipeId
                                                    )
                                                }
                                            >
                                                {recipeByAuthor.recipeName}
                                            </tr>
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

    const renderTop5Items = (): ReactElement => {
        return (
            <>
                <div className="top-5-container">
                    <div className="top-5-most-common-ingredients">
                        <div
                            onMouseDown={(event) => event.stopPropagation()}
                            className="top-5-title"
                        >
                            <p className="top-5-title-number">5</p>
                            <div className="top-5-title-text">
                                <p>Most</p>
                                <p>Common</p>
                                <p>Ingredients</p>
                            </div>
                        </div>
                        <div className="top-5-content">
                            {top5MostCommonRecipes.map(
                                (
                                    ingredient: CommonIngredient,
                                    counter: number = 0
                                ) => (
                                    <div className="top-5-content-item">
                                        <div>
                                            <h2>{++counter}.</h2>
                                        </div>
                                        <div>
                                            <h3>
                                                {capitalizeFirstLetter(
                                                    ingredient.name
                                                )}
                                            </h3>
                                            <p>
                                                Found in{" "}
                                                {ingredient.recipeCount} recipes
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="top-5-most-prolific-authors">
                        <div
                            onMouseDown={(event) => event.stopPropagation()}
                            className="top-5-title"
                        >
                            <p className="top-5-title-number">5</p>
                            <div className="top-5-title-text">
                                <p>Most</p>
                                <p>Prolific</p>
                                <p>Authors</p>
                            </div>
                        </div>
                        <div className="top-5-content">
                            {top5MostProlificAuthors.map(
                                (
                                    author: ProlificAuthor,
                                    counter: number = 0
                                ) => (
                                    <div
                                        onClick={(event) =>
                                            handleOnAuthorClick(
                                                event,
                                                author.authorName
                                            )
                                        }
                                        className="top-5-content-item"
                                    >
                                        <div>
                                            <h2>{++counter}.</h2>
                                        </div>
                                        <div>
                                            <h3>{author.authorName}</h3>
                                            <p>
                                                Wrote {author.recipeCount}{" "}
                                                recipes
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    <div className="top-5-most-complex-recipes">
                        <div
                            onMouseDown={(event) => event.stopPropagation()}
                            className="top-5-title"
                        >
                            <p className="top-5-title-number">5</p>
                            <div className="top-5-title-text">
                                <p>Most</p>
                                <p>Complex</p>
                                <p>Recipes</p>
                            </div>
                        </div>
                        <div className="top-5-content">
                            {top5MostComplexRecipes.map(
                                (recipe: Recipe, counter: number = 0) => (
                                    <div
                                        onClick={() =>
                                            handleOnRecipeClick(recipe)
                                        }
                                        className="top-5-content-item"
                                    >
                                        <div>
                                            <h3>
                                                {++counter}. {recipe.recipeName}
                                            </h3>
                                            <p>
                                                <i>by {recipe.authorName}</i>
                                            </p>
                                            <p>
                                                # of Ingredients :{" "}
                                                <b>{recipe.ingredientCount}</b>
                                            </p>
                                            <p>
                                                Skill:{" "}
                                                <span
                                                    style={{
                                                        textShadow:
                                                            "1px 1px 1px rgb(75, 75, 75)",
                                                    }}
                                                    className={
                                                        "skill-" +
                                                        recipe.skillLevel
                                                            .split(" ")
                                                            .join("")
                                                    }
                                                >
                                                    {recipe.skillLevel}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="top-5-container-mobile">
                    <div
                        className="top-5-most-common-ingredients-mobile"
                        onClick={() =>
                            setIsTop5IngredientsDropdownOpen(
                                !isTop5IngredientsDropdownOpen
                            )
                        }
                    >
                        <h1 className="top-5-title-mobile">
                            Top 5 Most Common Ingredients
                        </h1>
                        {isTop5IngredientsDropdownOpen && (
                            <div className="top-5-content-mobile">
                                {top5MostCommonRecipes.map(
                                    (
                                        ingredient: CommonIngredient,
                                        counter: number = 0
                                    ) => (
                                        <h3>
                                            {++counter}. {" "}
                                            {capitalizeFirstLetter(
                                                ingredient.name
                                            )} {" "}
                                            - Found in{" "}
                                            {ingredient.recipeCount}{" "}
                                            recipes
                                        </h3>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        className="top-5-most-prolific-authors-mobile"
                        onClick={() =>
                            setIsTop5AuthorsDropdownOpen(
                                !isTop5AuthorsDropdownOpen
                            )
                        }
                    >
                        <h1 className="top-5-title-mobile">
                            Top 5 most prolific authors
                        </h1>
                        {isTop5AuthorsDropdownOpen && (
                            <div className="top-5-content-mobile">
                                {top5MostProlificAuthors.map(
                                    (
                                        author: ProlificAuthor,
                                        counter: number = 0
                                    ) => (
                                        <h3
                                            onClick={(event) =>
                                                handleOnAuthorClick(
                                                    event,
                                                    author.authorName
                                                )
                                            }
                                        >
                                            {++counter}. {" "}
                                            {author.authorName}{" "}
                                            - Wrote {author.recipeCount}{" "}
                                            recipes
                                        </h3>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                    <div
                        className="top-5-most-complex-recipes-mobile"
                        onClick={() =>
                            setIsTop5RecipesDropdownOpen(
                                !isTop5RecipesDropdownOpen
                            )
                        }
                    >
                        <h1 className="top-5-title-mobile">Top 5 most complex recipes</h1>
                        {isTop5RecipesDropdownOpen && (
                            <div className="top-5-content-mobile">
                                {top5MostComplexRecipes.map(
                                    (recipe: Recipe, counter: number = 0) => (
                                        <h3
                                            onClick={() =>
                                                handleOnRecipeClick(recipe)
                                            }
                                        >
                                            <div>
                                                    {++counter}. {recipe.recipeName}
                                                    <i> - by {recipe.authorName}</i>
                                                <p>
                                                    # of Ingredients :{" "}
                                                    {recipe.ingredientCount} {" "}
                                                    <span>
                                                        - Skill:{" "}
                                                        <span
                                                            style={{
                                                                textShadow:
                                                                    "1px 1px 1px rgb(75, 75, 75)",
                                                            }}
                                                            className={
                                                                "skill-" +
                                                                recipe.skillLevel
                                                                    .split(" ")
                                                                    .join("")
                                                            }
                                                        >
                                                            {recipe.skillLevel}
                                                        </span>
                                                    </span>
                                                </p>
                                            </div>
                                        </h3>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    const renderTableHeaderItem = (
        name: string,
        sortBy: string,
        width: string
    ): ReactElement => {
        let icon;
        if (recipeDataConfig["sortBy"] === sortBy) {
            if (recipeDataConfig["order"] === "ASC") {
                icon = <FontAwesomeIcon icon={faSortUp} />;
            } else {
                icon = <FontAwesomeIcon icon={faSortDown} />;
            }
        } else {
            icon = <FontAwesomeIcon icon={faSort} />;
        }

        return (
            <th
                onClick={() => {
                        setRecipeDataConfig({
                            ...recipeDataConfig,
                            sortBy: sortBy,
                            order:
                                recipeDataConfig["order"] === "ASC"
                                    ? "DESC"
                                    : "ASC",
                        });
                        setCurrentPage(1);
                    }
                }
                style={{ width: width }}
            >
                <div>
                    <p>{name}</p>
                    {icon}
                </div>
            </th>
        );
    };

    return (
        <div
            className="app-background"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="app-container">
                {renderRecipeDetailsModal()}
                {renderAuthorDetailsModal()}
                <div className="app-title">
                    <h1>Recipes Glossary</h1>
                    <p>
                        by Radu Cristian Gîrlea | {" "}
                        <span>
                            <a
                                href="https://github.com/Radu3105"
                                target="_blank"
                            >
                                <FontAwesomeIcon
                                    icon={faGithub}
                                    size="lg"
                                    color="rgb(191 155 0)"
                                />{" "}
                                Radu3105
                            </a>
                        </span>
                    </p>
                </div>
                <div className="main-group">
                    {renderTop5Items()}
                    <div className="table-group">
                        <div className="table-func-group">
                            <div
                                className="filter-group"
                                onClick={() => setIsFilterDropdownOpen(true)}
                                onMouseLeave={() =>
                                    setIsFilterDropdownOpen(false)
                                }
                            >
                                {renderFilterDropdown()}
                                <p
                                    style={{
                                        marginRight: "20px",
                                        color: "gray",
                                    }}
                                >
                                    Select ingredient filters
                                </p>
                                {activeFilters.length === 0 ? (
                                    <p style={{ color: "gray" }}>Inactive</p>
                                ) : (
                                    <p style={{ color: "dodgerblue" }}>
                                        Active
                                    </p>
                                )}
                                <button type="submit">
                                    <FontAwesomeIcon
                                        icon={faFilter}
                                        size="lg"
                                        color={
                                            activeFilters.length === 0
                                                ? "gray"
                                                : "dodgerblue"
                                        }
                                    />
                                </button>
                            </div>
                            <form
                                className="search-group"
                                onSubmit={handleSearchSubmit}
                            >
                                <input
                                    type="search"
                                    placeholder="Search by recipe name"
                                    onChange={handleSearchInputChange}
                                />
                                <button type="submit">
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        size="lg"
                                        color="gray"
                                    />
                                </button>
                            </form>
                        </div>
                        <table className="recipe-table">
                            <thead>
                                <tr>
                                    {renderTableHeaderItem(
                                        "Name",
                                        "name",
                                        "45%"
                                    )}
                                    <th id="recipe-table-author-column-header" style={{ width: "25%" }}>Author</th>
                                    {renderTableHeaderItem(
                                        "# of Ingr.",
                                        "ingredientCount",
                                        "15%"
                                    )}
                                    {renderTableHeaderItem(
                                        "Skill Level",
                                        "skillLevel",
                                        "15%"
                                    )}
                                </tr>
                            </thead>
                            <tbody>{renderRecipes()}</tbody>
                        </table>
                        <div className="pagination">
                            <Stack spacing={2}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                />
                            </Stack>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
