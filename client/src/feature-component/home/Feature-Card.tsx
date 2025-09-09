import React from 'react';
import feature_img_spend from '../../assets/feature_img_spend.png'
import feature_img_loan from '../../assets/feature_img_loan.png'
import feature_img_goal from '../../assets/feature_img_goal.png'
import { MdAttachMoney } from "react-icons/md";
import { FaBalanceScale } from "react-icons/fa";
import { FiTarget } from "react-icons/fi";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


type FeatureType = "spend" | "loan" | "goal";

interface FeatureCardProps {
    iconColor?: string;
    iconBg?: string;
    heading?: string;
    title: FeatureType;
}


const FeatureCard: React.FC<FeatureCardProps> = ({iconColor, iconBg, heading, title}) => {
    const icons: Record<FeatureType, React.ElementType> = {
        spend: MdAttachMoney,
        loan: FaBalanceScale,
        goal: FiTarget
    }
    const featureImages: Record<FeatureType, string> = {
        spend: feature_img_spend,
        loan: feature_img_loan,
        goal: feature_img_goal
    }
    const IconComponent = icons[title];
    const ImageComponent = featureImages[title]
    return (
        <Card className="w-[280px] lg:w-[320px]">
            <CardHeader>
                <CardTitle className={`${iconBg} w-[36px] h-[36px] flex justify-center items-center rounded-full`}>
                    <IconComponent className={`text-2xl text-${iconColor}`}/>
                </CardTitle>
                <CardDescription className="text-base font-semibold text-dark">{heading}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">Effortlessly categorize your expenses, visualize spending patterns, and stay within budget with intuitive charts and reports.</p>
            </CardContent>
            <CardFooter>
                <img src={ImageComponent} alt="Feature" className="w-full h-auto"/>
            </CardFooter>
        </Card>
    );
};

export default FeatureCard;
