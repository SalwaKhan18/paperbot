// import useSWR from 'swr';

// const url = "/api/my-files"

// export default function useMyFiles() {
//     const {data,error} = useSWR(url)

//     return {
//         files: Array.isArray(data) ? data : [],     ///changed
//         isLoading: !error && !data,
//         isError: error
//     }
// }
import useSWR from "swr";

const url = "/api/my-files"

export default function useMyFiles() {
	const {data, error} = useSWR(url)

	return {
		files: Array.isArray(data) ? data : [],   // ✅ Always an array,
		isLoading: !error && !data,
		isError: error
	}
}