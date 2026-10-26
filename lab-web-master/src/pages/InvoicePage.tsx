import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { mobileQuotationApi } from "../services/api";

export const InvoicePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string>('');

    // Get requestId from query string
    const { requestId } = useParams<{ requestId: string }>();

    console.log(requestId);

    const fetchPdf = async (id: string) => {
        setLoading(true);
        try {
            const response = await mobileQuotationApi.getInvoice(id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            setPdfUrl(pdfUrl);
        } catch (error) {
            console.error('Error fetching PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (requestId) {
            fetchPdf(requestId);
        }
    }, [requestId]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    {loading ? (
                        <div className="text-center py-8">Loading PDF...</div>
                    ) : (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full min-h-[500px]"
                            title="Invoice PDF Viewer"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};