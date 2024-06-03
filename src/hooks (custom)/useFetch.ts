import { useState, useEffect } from 'react';
import axios from 'axios';
import { CommonIngredient } from '../interfaces/interfaces';
import { BASE_URL } from '../constants/constants';

const useFetch = <T,>(url: string, dependencies: any[] = []) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get<T>(url);
                setData(response.data);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchData();
    }, dependencies);

    return { data, error, loading };
};

export const useFetchTop5MostCommonIngredients = () => {
    return useFetch<CommonIngredient[]>(`${BASE_URL}`);
};

export default useFetch;
